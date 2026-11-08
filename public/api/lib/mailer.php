<?php
/**
 * Envio de e-mail.
 * - SMTP ativo + senha preenchida + PHPMailer disponível → usa SMTP (recomendado; ex.: Gmail com senha de app).
 * - Caso contrário → usa a função mail() do PHP.
 *
 * O PHPMailer já vem junto em /api/vendor/phpmailer/src (ou use "composer install" dentro de /api).
 */

declare(strict_types=1);

function phpmailer_disponivel(): bool
{
    if (class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
        return true;
    }
    $base = __DIR__ . '/../vendor';
    if (is_readable($base . '/autoload.php')) {
        require_once $base . '/autoload.php';
    } elseif (is_readable($base . '/phpmailer/src/PHPMailer.php')) {
        require_once $base . '/phpmailer/src/Exception.php';
        require_once $base . '/phpmailer/src/PHPMailer.php';
        require_once $base . '/phpmailer/src/SMTP.php';
    }
    return class_exists('PHPMailer\\PHPMailer\\PHPMailer');
}

function smtp_configurado(): bool
{
    $smtp = config()['email']['smtp'] ?? [];
    return !empty($smtp['ativo']) && (string) ($smtp['senha'] ?? '') !== '' && (string) ($smtp['host'] ?? '') !== '';
}

function cabecalho_utf8(string $s): string
{
    return '=?UTF-8?B?' . base64_encode($s) . '?=';
}

/**
 * Envia um e-mail de texto simples.
 * $para = null → vai para o destinatário configurado (você).
 */
function enviar_email(string $assunto, string $corpo, ?string $responderPara = null, ?string $responderNome = null, ?string $para = null): bool
{
    $cfg = config()['email'];
    $para = $para ?: (string) $cfg['destinatario'];
    $de = (string) $cfg['remetente'];
    $deNome = (string) ($cfg['remetente_nome'] ?? 'Site');
    $smtp = $cfg['smtp'] ?? [];

    if (smtp_configurado() && phpmailer_disponivel()) {
        $classe = 'PHPMailer\\PHPMailer\\PHPMailer';
        $m = new $classe(true);
        try {
            $m->isSMTP();
            $m->Host = (string) $smtp['host'];
            $m->Port = (int) $smtp['porta'];
            $m->SMTPAuth = true;
            $m->Username = (string) $smtp['usuario'];
            $m->Password = str_replace(' ', '', (string) $smtp['senha']);
            $m->SMTPSecure = ($smtp['seguranca'] ?? 'tls') === 'ssl' ? 'ssl' : 'tls';
            $m->CharSet = 'UTF-8';
            $m->Timeout = 15;
            $m->setFrom($de, $deNome);
            $m->addAddress($para);
            if ($responderPara) {
                $m->addReplyTo($responderPara, (string) $responderNome);
            }
            $m->Subject = $assunto;
            $m->Body = $corpo;
            $m->isHTML(false);
            return (bool) $m->send();
        } catch (Throwable $e) {
            error_log('[api portfolio] SMTP falhou: ' . $e->getMessage());
            return false;
        }
    }

    // Alternativa: mail() do PHP
    $limpa = function (string $s): string {
        return str_replace(["\r", "\n"], '', $s);
    };
    $headers = [
        'From: ' . cabecalho_utf8($limpa($deNome)) . ' <' . $limpa($de) . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    if ($responderPara) {
        $headers[] = 'Reply-To: ' . $limpa($responderPara);
    }
    if (!function_exists('mail')) {
        return false;
    }
    return @mail($limpa($para), cabecalho_utf8($assunto), $corpo, implode("\r\n", $headers));
}
