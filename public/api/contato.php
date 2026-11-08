<?php
/**
 * POST /api/contato.php  (JSON)
 * { nome, email, empresa?, telefone?, assunto, mensagem, website?, t? }
 * Envia a mensagem do formulário para o e-mail do Luiz (e uma resposta automática ao visitante).
 */

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/mailer.php';

exigir_metodo('POST');
$cfg = config();
$in = corpo_json();

$ok = ['ok' => true, 'mensagem' => 'Recebi sua mensagem e respondo o quanto antes. Obrigado pelo contato!'];

// Anti-robô: campo escondido preenchido OU formulário enviado rápido demais (< 2,5 s)
if (!empty($in['website']) || (isset($in['t']) && is_numeric($in['t']) && (int) $in['t'] < 2500)) {
    responder(200, $ok);
}

$ASSUNTOS = ['Vaga de e-commerce', 'Vaga de tecnologia', 'Freela / projeto', 'Outro assunto'];

$nome = texto($in['nome'] ?? '', 80);
$email = texto($in['email'] ?? '', 120);
$empresa = texto($in['empresa'] ?? '', 80);
$telefone = texto($in['telefone'] ?? '', 20);
$assunto = texto($in['assunto'] ?? '', 40);
$mensagem = texto($in['mensagem'] ?? '', 3000, true);

if (!in_array($assunto, $ASSUNTOS, true)) {
    $assunto = 'Outro assunto';
}
if (tamanho($nome) < 2) {
    erro(422, 'validacao', 'Informe seu nome.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    erro(422, 'validacao', 'Informe um e-mail válido para eu te responder.');
}
if (tamanho($mensagem) < 10) {
    erro(422, 'validacao', 'Escreva uma mensagem um pouco maior (mínimo de 10 caracteres).');
}

limitar('contato', (int) ($cfg['limites']['contatos_por_hora'] ?? 5));

$corpo = "Nova mensagem pelo portfólio\n"
    . "----------------------------------------\n"
    . "Nome: {$nome}\n"
    . "E-mail: {$email}\n"
    . ($empresa !== '' ? "Empresa: {$empresa}\n" : '')
    . ($telefone !== '' ? "Telefone: {$telefone}\n" : '')
    . "Assunto: {$assunto}\n"
    . "----------------------------------------\n\n"
    . $mensagem . "\n\n"
    . "(Responda este e-mail para falar direto com {$nome}.)\n";

$titulo = '[Portfólio] ' . $assunto . ' — ' . $nome . ($empresa !== '' ? ' · ' . $empresa : '');
if (!enviar_email($titulo, $corpo, $email, $nome)) {
    erro(502, 'email', 'Não consegui enviar agora. Tente de novo mais tarde ou me chame no WhatsApp.');
}

// Responde ao visitante e depois manda a resposta automática.
responder_e_continuar(200, $ok);

if (!empty($cfg['email']['resposta_automatica'])) {
    try {
        $resposta = "Olá, {$nome}!\n\n"
            . "Recebi sua mensagem pelo meu portfólio e respondo o quanto antes.\n"
            . "Se preferir, você também pode marcar um horário direto na minha agenda pelo site.\n\n"
            . "Sua mensagem:\n"
            . "----------------------------------------\n"
            . $mensagem . "\n"
            . "----------------------------------------\n\n"
            . "Obrigado!\nLuiz Vilarinho\n"
            . "Analista de E-commerce · Ribeirão Preto/SP\n";
        enviar_email('Recebi sua mensagem — Luiz Vilarinho', $resposta, (string) $cfg['email']['destinatario'], 'Luiz Vilarinho', $email);
    } catch (Throwable $e) {
        error_log('[api portfolio] resposta automática falhou: ' . $e->getMessage());
    }
}
exit;
