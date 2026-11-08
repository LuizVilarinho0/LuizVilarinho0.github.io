<?php
/**
 * GET /api/status.php?chave=SUA_CHAVE
 * Diagnóstico da instalação: mostra o que está ok e o que falta.
 * Só funciona se 'chave_diagnostico' estiver preenchida no config.php.
 * Acrescente &teste_email=1 para enviar um e-mail de teste para você.
 */

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/agenda.php';
require __DIR__ . '/lib/mailer.php';

$cfg = config();
$chave = (string) ($cfg['chave_diagnostico'] ?? '');
if ($chave === '' || !hash_equals($chave, (string) ($_GET['chave'] ?? ''))) {
    erro(404, 'nao_encontrado', 'Não encontrado.');
}

$checks = [];
$add = function (string $nome, bool $ok, string $detalhe = '') use (&$checks) {
    $checks[] = ['item' => $nome, 'ok' => $ok, 'detalhe' => $detalhe];
};

$add('PHP 7.4 ou mais novo', version_compare(PHP_VERSION, '7.4.0', '>='), PHP_VERSION);
$add('Extensão curl', function_exists('curl_init'));
$add('Extensão openssl', function_exists('openssl_sign'));
$add('Extensão mbstring', function_exists('mb_substr'), 'opcional');

$gravavel = false;
try {
    $gravavel = is_writable(storage());
} catch (Throwable $e) {
}
$add('Pasta api/storage gravável', $gravavel);

$add('Modo demonstração desligado', !modo_demo(), modo_demo() ? 'modo_demo = true (agenda de exemplo)' : '');

if (!modo_demo()) {
    try {
        google_credenciais();
        $add('Credenciais do Google', true);
        [$hoje] = agenda_janela();
        $ocup = google_ocupados($hoje, $hoje->modify('+7 days'));
        $add('Leitura do Google Agenda', true, count($ocup) . ' compromisso(s) nos próximos 7 dias');
    } catch (Throwable $e) {
        $add('Conexão com o Google Agenda', false, $e->getMessage());
    }
}

if (smtp_configurado()) {
    $add('PHPMailer instalado', phpmailer_disponivel(), 'necessário para SMTP');
    $add('SMTP configurado', true, (string) $cfg['email']['smtp']['host']);
} else {
    $add('SMTP configurado', false, 'sem senha: usando mail() do PHP (pode cair no spam)');
    $add('Função mail() disponível', function_exists('mail'));
}

if (!empty($_GET['teste_email'])) {
    $enviado = enviar_email('Teste do portfólio', "Se você recebeu este e-mail, o envio está funcionando. \u{2705}");
    $add('Envio de e-mail de teste', $enviado, $enviado ? 'confira a caixa de entrada (e o spam)' : 'veja o log de erros do PHP');
}

responder(200, ['ok' => true, 'checks' => $checks]);
