<?php
/**
 * Integração com o Google Agenda usando uma CONTA DE SERVIÇO.
 * Não depende de bibliotecas externas: só das extensões curl e openssl do PHP.
 *
 * Fluxo: assina um JWT com a chave privada da conta de serviço → troca por um
 * access token (válido por 1 h, guardado em cache) → chama a API do Calendar.
 */

declare(strict_types=1);

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_API = 'https://www.googleapis.com/calendar/v3';
const GOOGLE_ESCOPO = 'https://www.googleapis.com/auth/calendar';

function google_credenciais(): array
{
    $arquivo = config()['google']['credenciais'] ?? '';
    if (!$arquivo || !is_readable($arquivo)) {
        throw new RuntimeException('Arquivo de credenciais do Google não encontrado: ' . $arquivo);
    }
    $cred = json_decode((string) file_get_contents($arquivo), true);
    if (!is_array($cred) || empty($cred['client_email']) || empty($cred['private_key'])) {
        throw new RuntimeException('Arquivo de credenciais do Google inválido (precisa ter client_email e private_key).');
    }
    return $cred;
}

function b64url(string $s): string
{
    return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}

/** Faz uma requisição HTTP e devolve [status, corpo decodificado]. */
function google_http(string $metodo, string $url, $corpo = null, ?string $token = null, bool $formulario = false): array
{
    if (!function_exists('curl_init')) {
        throw new RuntimeException('A extensão curl do PHP não está ativa na hospedagem.');
    }
    $ch = curl_init($url);
    $headers = ['Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    if ($corpo !== null) {
        if ($formulario) {
            $headers[] = 'Content-Type: application/x-www-form-urlencoded';
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($corpo));
        } else {
            $headers[] = 'Content-Type: application/json';
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($corpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        }
    }
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST  => $metodo,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 6,
        CURLOPT_TIMEOUT        => 15,
    ]);
    $resposta = curl_exec($ch);
    if ($resposta === false) {
        $msg = curl_error($ch);
        curl_close($ch);
        throw new RuntimeException('Falha de conexão com o Google: ' . $msg);
    }
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    $dados = json_decode((string) $resposta, true);
    return [$status, is_array($dados) ? $dados : []];
}

/** Access token OAuth da conta de serviço (com cache em arquivo). */
function google_token(): string
{
    $cacheArq = storage() . '/google-token.json';
    $cache = is_readable($cacheArq) ? json_decode((string) file_get_contents($cacheArq), true) : null;
    if (is_array($cache) && !empty($cache['token']) && ($cache['expira'] ?? 0) > time() + 60) {
        return (string) $cache['token'];
    }

    if (!function_exists('openssl_sign')) {
        throw new RuntimeException('A extensão openssl do PHP não está ativa na hospedagem.');
    }

    $cred = google_credenciais();
    $agora = time();
    $cabecalho = b64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $claims = b64url(json_encode([
        'iss'   => $cred['client_email'],
        'scope' => GOOGLE_ESCOPO,
        'aud'   => GOOGLE_TOKEN_URL,
        'iat'   => $agora,
        'exp'   => $agora + 3600,
    ]));
    $assinatura = '';
    $chave = openssl_pkey_get_private($cred['private_key']);
    if (!$chave || !openssl_sign($cabecalho . '.' . $claims, $assinatura, $chave, OPENSSL_ALGO_SHA256)) {
        throw new RuntimeException('Não foi possível assinar o JWT (chave privada inválida?).');
    }
    $jwt = $cabecalho . '.' . $claims . '.' . b64url($assinatura);

    [$status, $dados] = google_http('POST', GOOGLE_TOKEN_URL, [
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion'  => $jwt,
    ], null, true);

    if ($status !== 200 || empty($dados['access_token'])) {
        throw new RuntimeException('Google recusou a autenticação (' . $status . '): ' . json_encode($dados));
    }

    @file_put_contents($cacheArq, json_encode([
        'token'  => $dados['access_token'],
        'expira' => $agora + (int) ($dados['expires_in'] ?? 3600),
    ]), LOCK_EX);

    return (string) $dados['access_token'];
}

function google_calendar_id(): string
{
    $id = (string) (config()['google']['calendar_id'] ?? '');
    if ($id === '' || strpos($id, 'SEU-EMAIL') !== false) {
        throw new RuntimeException('Defina google.calendar_id no config.php.');
    }
    return $id;
}

/**
 * Intervalos ocupados da agenda entre $de e $ate.
 * @return array<int, array{0: DateTimeImmutable, 1: DateTimeImmutable}>
 */
function google_ocupados(DateTimeImmutable $de, DateTimeImmutable $ate): array
{
    $id = google_calendar_id();
    [$status, $dados] = google_http('POST', GOOGLE_API . '/freeBusy', [
        'timeMin'  => $de->format(DATE_RFC3339),
        'timeMax'  => $ate->format(DATE_RFC3339),
        'timeZone' => config()['timezone'],
        'items'    => [['id' => $id]],
    ], google_token());

    if ($status !== 200) {
        throw new RuntimeException('Erro ao consultar a agenda (' . $status . '): ' . json_encode($dados));
    }
    $cal = $dados['calendars'][$id] ?? null;
    if (!$cal) {
        throw new RuntimeException('A resposta do Google não trouxe a agenda ' . $id);
    }
    if (!empty($cal['errors'])) {
        throw new RuntimeException(
            'Sem acesso à agenda ' . $id . ': ' . json_encode($cal['errors']) .
            ' — compartilhe a agenda com o e-mail da conta de serviço.'
        );
    }
    $saida = [];
    foreach ($cal['busy'] ?? [] as $b) {
        $saida[] = [
            (new DateTimeImmutable($b['start']))->setTimezone(tz()),
            (new DateTimeImmutable($b['end']))->setTimezone(tz()),
        ];
    }
    return $saida;
}

/** Cria um evento na agenda e devolve o recurso criado. */
function google_criar_evento(array $evento): array
{
    $url = GOOGLE_API . '/calendars/' . rawurlencode(google_calendar_id()) . '/events';
    [$status, $dados] = google_http('POST', $url, $evento, google_token());
    if ($status < 200 || $status >= 300) {
        throw new RuntimeException('Erro ao criar evento (' . $status . '): ' . json_encode($dados));
    }
    return $dados;
}
