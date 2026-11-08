<?php
/**
 * GET /api/agenda.php?inicio=AAAA-MM-DD&fim=AAAA-MM-DD
 * Devolve, para cada dia e tipo de reserva, os horários e se estão livres.
 */

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/agenda.php';

exigir_metodo('GET');
config();

[$hoje, $limite] = agenda_janela();

$inicio = data_iso($_GET['inicio'] ?? '') ?? $hoje;
$fim = data_iso($_GET['fim'] ?? '') ?? $inicio->modify('+34 days');

// Ajusta o intervalo para a janela permitida (no máx. 93 dias por consulta)
if ($inicio < $hoje) {
    $inicio = $hoje;
}
if ($fim > $limite) {
    $fim = $limite;
}
if ($fim > $inicio->modify('+92 days')) {
    $fim = $inicio->modify('+92 days');
}

$tiposCfg = agenda_cfg()['tipos'];
$dias = new stdClass();

if ($fim >= $inicio) {
    // Busca os ocupados com folga (shows que atravessam a meia-noite + margens)
    $ocupados = agenda_ocupados($inicio->modify('-1 day'), $fim->modify('+2 days'));
    $minimo = agenda_inicio_minimo();

    for ($d = $inicio; $d <= $fim; $d = $d->modify('+1 day')) {
        $porTipo = [];
        foreach ($tiposCfg as $id => $tipo) {
            // Horários dentro da antecedência mínima nem aparecem (não são "ocupados", só tarde demais)
            $possiveis = array_values(array_filter(agenda_slots_do_dia($tipo, $d), function ($s) use ($minimo) {
                return $s['inicio'] >= $minimo;
            }));
            $porTipo[$id] = array_map(function ($s) use ($tipo, $ocupados) {
                return [
                    'id'     => $s['id'],
                    'rotulo' => $s['rotulo'],
                    'inicio' => $s['inicio']->format('H:i'),
                    'fim'    => $s['fim']->format('H:i'),
                    'livre'  => agenda_slot_livre($s, $tipo, $ocupados),
                ];
            }, $possiveis);
        }
        $dias->{$d->format('Y-m-d')} = $porTipo;
    }
}

responder(200, [
    'ok'          => true,
    'demo'        => modo_demo(),
    'timezone'    => config()['timezone'],
    'atualizadoEm' => agora()->format(DATE_ATOM),
    'hoje'        => $hoje->format('Y-m-d'),
    'limite'      => $limite->format('Y-m-d'),
    'tipos'       => agenda_tipos_publicos(),
    'dias'        => $dias,
]);
