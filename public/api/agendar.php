<?php
/**
 * POST /api/agendar.php  (JSON)
 * { tipo, data, slot, nome, email, empresa?, telefone?, formato, pauta?, website? }
 *
 * Confere de novo se o horário está livre (direto no Google, sem cache), cria o
 * evento no Google Agenda, avisa o Luiz por e-mail e manda a confirmação para o visitante.
 */

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/agenda.php';
require __DIR__ . '/lib/mailer.php';

exigir_metodo('POST');
$cfg = config();
$in = corpo_json();

$FORMATOS = [
    'online'     => 'Online',
    'ligacao'    => 'Ligação',
    'presencial' => 'Presencial',
];

// Honeypot: robôs preenchem o campo escondido. Fingimos sucesso e não fazemos nada.
if (!empty($in['website'])) {
    responder(200, ['ok' => true, 'agendamento' => [
        'tipo' => '', 'tipoRotulo' => '', 'data' => date('Y-m-d'), 'slot' => '', 'inicio' => '', 'fim' => '', 'formato' => 'online', 'linkReuniao' => '',
    ]]);
}

// ---------------------------------------------------------------- validação
$tipoId = texto($in['tipo'] ?? '', 40);
$tipos = agenda_cfg()['tipos'];
if (!isset($tipos[$tipoId])) {
    erro(422, 'validacao', 'Tipo de conversa inválido.');
}
$tipo = $tipos[$tipoId];

$dia = data_iso($in['data'] ?? '');
if (!$dia) {
    erro(422, 'validacao', 'Data inválida.');
}
[$hoje, $limite] = agenda_janela();
if ($dia < $hoje || $dia > $limite) {
    erro(422, 'validacao', 'Essa data está fora da agenda disponível.');
}

$slotId = texto($in['slot'] ?? '', 20);
$slot = null;
foreach (agenda_slots_do_dia($tipo, $dia) as $s) {
    if ($s['id'] === $slotId) {
        $slot = $s;
        break;
    }
}
if (!$slot) {
    erro(422, 'validacao', 'Horário inválido para esse dia.');
}
if ($slot['inicio'] < agenda_inicio_minimo()) {
    erro(409, 'ocupado', 'Esse horário está muito em cima da hora para agendar pelo site. Escolha outro ou me chame no WhatsApp.');
}

$nome = texto($in['nome'] ?? '', 80);
$email = texto($in['email'] ?? '', 120);
$empresa = texto($in['empresa'] ?? '', 80);
$telefone = preg_replace('/\D/', '', (string) ($in['telefone'] ?? ''));
$formato = texto($in['formato'] ?? 'online', 20);
$pauta = texto($in['pauta'] ?? '', 600, true);

if (tamanho($nome) < 2) {
    erro(422, 'validacao', 'Informe seu nome.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    erro(422, 'validacao', 'Informe um e-mail válido: é por ele que você recebe a confirmação.');
}
if ($telefone !== '' && (strlen($telefone) < 10 || strlen($telefone) > 13)) {
    erro(422, 'validacao', 'Confira o telefone (com DDD) ou deixe em branco.');
}
if (!isset($FORMATOS[$formato])) {
    $formato = 'online';
}

// Só verifica aqui; a tentativa conta apenas se o agendamento for concluído.
limitar('agendar', (int) ($cfg['limites']['agendamentos_por_hora'] ?? 3), 3600, false);

$linkOnline = (string) ($cfg['reuniao']['link_online'] ?? '');
$enderecoPresencial = (string) ($cfg['reuniao']['endereco_presencial'] ?? '');

// telefone formatado (opcional)
$telFormatado = '';
$telLink = '';
if ($telefone !== '') {
    $nacional = (strlen($telefone) >= 12 && substr($telefone, 0, 2) === '55') ? substr($telefone, 2) : $telefone;
    $ddd = substr($nacional, 0, 2);
    $num = substr($nacional, 2);
    $telFormatado = '(' . $ddd . ') ' . substr($num, 0, -4) . '-' . substr($num, -4);
    $telLink = 'https://wa.me/55' . $nacional;
}

$quem = $empresa !== '' ? $nome . ' (' . $empresa . ')' : $nome;
$resumo = sprintf('%s · %s', $tipo['rotulo'], $quem);
$local = $formato === 'online' ? ($linkOnline !== '' ? $linkOnline : 'Online') : ($formato === 'presencial' ? $enderecoPresencial : 'Ligação' . ($telFormatado ? ' · ' . $telFormatado : ''));

$descricao = implode("\n", array_filter([
    'Agendado pelo portfólio.',
    '',
    'Nome: ' . $nome,
    'E-mail: ' . $email,
    $empresa !== '' ? 'Empresa: ' . $empresa : null,
    $telFormatado !== '' ? 'Telefone: ' . $telFormatado . ' — ' . $telLink : null,
    'Formato: ' . $FORMATOS[$formato],
    ($formato === 'online' && $linkOnline !== '') ? 'Link: ' . $linkOnline : null,
    $pauta !== '' ? "Pauta:\n" . $pauta : null,
    '',
    'Para cancelar, apague este evento e avise a pessoa por e-mail.',
], function ($l) {
    return $l !== null;
}));

// ---------------------------------------------------------------- agendamento (com trava)
$trava = fopen(storage() . '/agenda.lock', 'c');
if ($trava) {
    flock($trava, LOCK_EX);
}

try {
    // Confere direto na fonte, sem cache: alguém pode ter acabado de agendar.
    $margem = (int) ($tipo['margem_minutos'] ?? 0);
    $ocupados = agenda_ocupados(
        $slot['inicio']->modify('-' . ($margem + 60) . ' minutes'),
        $slot['fim']->modify('+' . ($margem + 60) . ' minutes'),
        false
    );
    if (!agenda_slot_livre($slot, $tipo, $ocupados)) {
        erro(409, 'ocupado', 'Ops! Esse horário acabou de ser ocupado. Escolha outro.');
    }

    if (modo_demo()) {
        demo_registrar($slot['inicio'], $slot['fim'], $resumo);
    } else {
        google_criar_evento([
            'summary'     => $resumo,
            'description' => $descricao,
            'location'    => $local,
            'colorId'     => (string) ($cfg['evento']['cor'] ?? '6'),
            'start'       => ['dateTime' => $slot['inicio']->format(DATE_RFC3339), 'timeZone' => $cfg['timezone']],
            'end'         => ['dateTime' => $slot['fim']->format(DATE_RFC3339), 'timeZone' => $cfg['timezone']],
            'reminders'   => ['useDefault' => false, 'overrides' => [['method' => 'popup', 'minutes' => 30]]],
            'extendedProperties' => ['private' => ['origem' => 'portfolio', 'tipo' => $tipoId, 'email' => $email]],
        ]);
    }

    agenda_limpar_cache();
    limite_registrar('agendar');
} finally {
    if ($trava) {
        flock($trava, LOCK_UN);
        fclose($trava);
    }
}

// Responde ao visitante primeiro (o agendamento já está feito)...
responder_e_continuar(200, [
    'ok' => true,
    'agendamento' => [
        'tipo'        => $tipoId,
        'tipoRotulo'  => $tipo['rotulo'],
        'data'        => $dia->format('Y-m-d'),
        'slot'        => $slot['id'],
        'inicio'      => $slot['inicio']->format('H:i'),
        'fim'         => $slot['fim']->format('H:i'),
        'formato'     => $formato,
        'linkReuniao' => $formato === 'online' ? $linkOnline : '',
    ],
]);

// ...e depois envia os e-mails (se falharem, o agendamento continua valendo).
$quando = data_por_extenso($slot['inicio']) . ', das ' . $slot['inicio']->format('H:i') . ' às ' . $slot['fim']->format('H:i');

if (!empty($cfg['email']['avisar_agendamentos'])) {
    try {
        enviar_email(
            'Novo agendamento: ' . $tipo['rotulo'] . ' em ' . $slot['inicio']->format('d/m') . ' às ' . $slot['inicio']->format('H:i') . ' — ' . $quem,
            $descricao . "\n\nQuando: " . $quando . ' (horário de Brasília)',
            $email,
            $nome
        );
    } catch (Throwable $e) {
        error_log('[api portfolio] aviso de agendamento falhou: ' . $e->getMessage());
    }
}

if (!empty($cfg['email']['confirmar_para_visitante'])) {
    try {
        $comoEntrar = $formato === 'online'
            ? ($linkOnline !== '' ? 'Link da chamada: ' . $linkOnline : 'Vou te enviar o link da chamada por e-mail antes do horário.')
            : ($formato === 'presencial' ? 'Local: ' . $enderecoPresencial : 'Eu te ligo no horário marcado' . ($telFormatado ? ' (' . $telFormatado . ').' : '. Se puder, responda este e-mail com o seu telefone.'));
        $corpo = "Olá, {$nome}!\n\n"
            . "Seu horário está confirmado:\n\n"
            . "  {$tipo['rotulo']} com Luiz Vilarinho\n"
            . "  {$quando} (horário de Brasília)\n"
            . "  Formato: {$FORMATOS[$formato]}\n\n"
            . $comoEntrar . "\n\n"
            . "Se precisar remarcar ou cancelar, é só responder este e-mail.\n\n"
            . "Até lá!\nLuiz Vilarinho\n"
            . "Analista de E-commerce · Ribeirão Preto/SP\n";
        $destino = (string) $cfg['email']['destinatario'];
        enviar_email('Confirmado: ' . $tipo['rotulo'] . ' com Luiz Vilarinho — ' . $slot['inicio']->format('d/m') . ' às ' . $slot['inicio']->format('H:i'), $corpo, $destino, 'Luiz Vilarinho', $email);
    } catch (Throwable $e) {
        error_log('[api portfolio] confirmação ao visitante falhou: ' . $e->getMessage());
    }
}
exit;

/** "segunda-feira, 9 de novembro de 2026" sem depender da extensão intl. */
function data_por_extenso(DateTimeImmutable $d): string
{
    $dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    $meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return $dias[(int) $d->format('w')] . ', ' . (int) $d->format('j') . ' de ' . $meses[(int) $d->format('n') - 1] . ' de ' . $d->format('Y');
}
