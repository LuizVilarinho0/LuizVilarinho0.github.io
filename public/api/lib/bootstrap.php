<?php
/**
 * Funções comuns da API: configuração, respostas JSON, validação e limites.
 * Compatível com PHP 7.4+.
 */

declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(E_ALL);

function config(): array
{
    static $cfg = null;
    if ($cfg === null) {
        $cfg = require __DIR__ . '/../config.php';
        // Segredos (senha do SMTP etc.) podem ficar em config.local.php, fora do Git.
        $local = __DIR__ . '/../config.local.php';
        if (is_readable($local)) {
            $extra = require $local;
            if (is_array($extra)) {
                $cfg = array_replace_recursive($cfg, $extra);
            }
        }
        date_default_timezone_set($cfg['timezone'] ?? 'America/Sao_Paulo');
    }
    return $cfg;
}

function tz(): DateTimeZone
{
    static $tz = null;
    if ($tz === null) {
        $tz = new DateTimeZone(config()['timezone'] ?? 'America/Sao_Paulo');
    }
    return $tz;
}

function agora(): DateTimeImmutable
{
    return new DateTimeImmutable('now', tz());
}

/** Envia JSON e encerra. */
function responder(int $status, array $dados): void
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, max-age=0');
        header('X-Content-Type-Options: nosniff');
    }
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Envia a resposta ao visitante e encerra a conexão, mas deixa o script
 * continuar rodando (para tarefas lentas, como enviar e-mail).
 * Funciona em PHP-FPM e LiteSpeed; em outros servidores, só envia a resposta.
 */
function responder_e_continuar(int $status, array $dados): void
{
    $json = json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    ignore_user_abort(true);
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    header('X-Content-Type-Options: nosniff');
    header('Content-Length: ' . strlen((string) $json));
    header('Connection: close');
    echo $json;
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } elseif (function_exists('litespeed_finish_request')) {
        litespeed_finish_request();
    } else {
        while (ob_get_level() > 0) {
            ob_end_flush();
        }
        flush();
    }
}

function erro(int $status, string $codigo, string $mensagem): void
{
    responder($status, ['ok' => false, 'codigo' => $codigo, 'erro' => $mensagem]);
}

// Qualquer exceção não tratada vira um erro 500 genérico (o detalhe vai para o log do servidor).
set_exception_handler(function (Throwable $e): void {
    error_log('[api portfolio] ' . $e->getMessage() . ' em ' . $e->getFile() . ':' . $e->getLine());
    erro(500, 'servidor', 'Tive um problema técnico aqui. Tente de novo em instantes ou me chame no WhatsApp.');
});

function exigir_metodo(string $metodo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $metodo) {
        header('Allow: ' . $metodo);
        erro(405, 'metodo', 'Método não permitido.');
    }
}

/** Lê o corpo JSON da requisição (máx. 16 KB). */
function corpo_json(): array
{
    $tipo = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    if (stripos($tipo, 'application/json') === false) {
        erro(415, 'formato', 'Envie os dados em JSON.');
    }
    $bruto = file_get_contents('php://input', false, null, 0, 16384);
    $dados = json_decode((string) $bruto, true);
    if (!is_array($dados)) {
        erro(400, 'formato', 'Dados inválidos.');
    }
    return $dados;
}

/** Texto limpo: sem caracteres de controle (mantém quebras de linha se $multilinha). */
function texto($valor, int $max, bool $multilinha = false): string
{
    if (!is_string($valor)) {
        return '';
    }
    $padrao = $multilinha ? '/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/u' : '/[\x00-\x1F\x7F]/u';
    $v = trim((string) preg_replace($padrao, '', $valor));
    if (function_exists('mb_substr')) {
        return mb_substr($v, 0, $max, 'UTF-8');
    }
    return substr($v, 0, $max);
}

function tamanho(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

/** Pasta de dados graváveis (cache, limites, modo demo). */
function storage(string $sub = ''): string
{
    $dir = __DIR__ . '/../storage' . ($sub !== '' ? '/' . $sub : '');
    if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
        throw new RuntimeException('Não foi possível criar a pasta ' . $dir . ' (verifique as permissões).');
    }
    return $dir;
}

function ip_cliente(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

/**
 * Limite de requisições por IP numa janela de tempo.
 * $registrar = false só verifica (use limite_registrar() depois que a ação der certo).
 */
function limitar(string $acao, int $maximo, int $janela = 3600, bool $registrar = true): void
{
    if ($maximo <= 0) {
        return;
    }
    limite_processar($acao, $maximo, $janela, $registrar);
}

function limite_registrar(string $acao, int $janela = 3600): void
{
    limite_processar($acao, PHP_INT_MAX, $janela, true);
}

function limite_processar(string $acao, int $maximo, int $janela, bool $registrar): void
{
    $arquivo = storage('limites') . '/' . sha1($acao . '|' . ip_cliente()) . '.json';
    $fp = fopen($arquivo, 'c+');
    if (!$fp) {
        return; // se não der para gravar, não bloqueia o visitante
    }
    flock($fp, LOCK_EX);
    $conteudo = stream_get_contents($fp);
    $lista = json_decode($conteudo ?: '[]', true);
    $lista = is_array($lista) ? $lista : [];
    $limite = time() - $janela;
    $lista = array_values(array_filter($lista, function ($t) use ($limite) {
        return is_int($t) && $t > $limite;
    }));
    if (count($lista) >= $maximo) {
        flock($fp, LOCK_UN);
        fclose($fp);
        erro(429, 'limite', 'Muitas tentativas em pouco tempo. Tente de novo mais tarde ou me chame no WhatsApp.');
    }
    if ($registrar) {
        $lista[] = time();
    }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($lista));
    flock($fp, LOCK_UN);
    fclose($fp);
}

/** Converte "AAAA-MM-DD" em data (meia-noite no fuso configurado) ou null. */
function data_iso($valor): ?DateTimeImmutable
{
    if (!is_string($valor) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $valor)) {
        return null;
    }
    $d = DateTimeImmutable::createFromFormat('!Y-m-d', $valor, tz());
    if (!$d || $d->format('Y-m-d') !== $valor) {
        return null;
    }
    return $d;
}
