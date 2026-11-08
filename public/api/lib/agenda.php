<?php
/**
 * Regras da agenda: gera os horários de cada dia a partir do config.php,
 * consulta o que está ocupado (Google ou modo demo) e decide o que está livre.
 */

declare(strict_types=1);

require_once __DIR__ . '/google.php';

function agenda_cfg(): array
{
    return config()['agenda'];
}

function modo_demo(): bool
{
    return (bool) (config()['modo_demo'] ?? true);
}

/** Tipos de conversa, no formato público (sem regras internas). */
function agenda_tipos_publicos(): array
{
    $out = [];
    foreach (agenda_cfg()['tipos'] as $id => $t) {
        $out[] = [
            'id'        => (string) $id,
            'rotulo'    => (string) $t['rotulo'],
            'descricao' => (string) ($t['descricao'] ?? ''),
            'duracao'   => (int) ($t['duracao_minutos'] ?? 60),
        ];
    }
    return $out;
}

function hora_no_dia(DateTimeImmutable $dia, string $hhmm): DateTimeImmutable
{
    [$h, $m] = array_map('intval', explode(':', $hhmm));
    return $dia->setTime($h, $m);
}

/**
 * Janelas de disponibilidade do tipo em um dia da semana.
 * Aceita o formato novo ('janelas') e o antigo ('dias_semana' + 'inicio'/'fim').
 * @return array<int, array{0: string, 1: string}>
 */
function agenda_janelas_do_dia(array $tipo, int $diaSemana): array
{
    $out = [];
    if (!empty($tipo['janelas'])) {
        foreach ($tipo['janelas'] as $j) {
            if (in_array($diaSemana, $j['dias'] ?? [], true)) {
                $out[] = [(string) $j['inicio'], (string) $j['fim']];
            }
        }
        return $out;
    }
    if (in_array($diaSemana, $tipo['dias_semana'] ?? [0, 1, 2, 3, 4, 5, 6], true) && isset($tipo['inicio'], $tipo['fim'])) {
        $out[] = [(string) $tipo['inicio'], (string) $tipo['fim']];
    }
    return $out;
}

/**
 * Horários possíveis de um tipo em um dia (ainda sem saber se estão livres).
 * @return array<int, array{id: string, rotulo: string, inicio: DateTimeImmutable, fim: DateTimeImmutable}>
 */
function agenda_slots_do_dia(array $tipo, DateTimeImmutable $dia): array
{
    $cfg = agenda_cfg();
    if (in_array($dia->format('Y-m-d'), $cfg['datas_bloqueadas'] ?? [], true)) {
        return [];
    }

    $slots = [];
    $vistos = [];

    if (($tipo['modo'] ?? 'horario') === 'periodo') {
        // Períodos fixos do dia (mantido por compatibilidade)
        if (!in_array((int) $dia->format('w'), $tipo['dias_semana'] ?? [0, 1, 2, 3, 4, 5, 6], true)) {
            return [];
        }
        foreach ($tipo['periodos'] ?? [] as $p) {
            $ini = hora_no_dia($dia, $p['inicio']);
            $fim = hora_no_dia($dia, $p['fim']);
            if ($fim <= $ini) {
                $fim = $fim->modify('+1 day');
            }
            $slots[] = ['id' => (string) $p['id'], 'rotulo' => (string) $p['rotulo'], 'inicio' => $ini, 'fim' => $fim];
        }
        return $slots;
    }

    $dur = max(15, (int) ($tipo['duracao_minutos'] ?? 60));
    $passo = max(5, (int) ($tipo['passo_minutos'] ?? $dur));
    $pausas = [];
    foreach ($tipo['pausas'] ?? [] as $p) {
        $pausas[] = [hora_no_dia($dia, $p[0]), hora_no_dia($dia, $p[1])];
    }

    foreach (agenda_janelas_do_dia($tipo, (int) $dia->format('w')) as [$jIni, $jFim]) {
        $inicio = hora_no_dia($dia, $jIni);
        $fim = hora_no_dia($dia, $jFim);
        for ($t = $inicio; $t->modify("+{$dur} minutes") <= $fim; $t = $t->modify("+{$passo} minutes")) {
            $tf = $t->modify("+{$dur} minutes");
            foreach ($pausas as [$pi, $pf]) {
                if ($t < $pf && $tf > $pi) {
                    continue 2;
                }
            }
            $id = $t->format('H:i');
            if (isset($vistos[$id])) {
                continue;
            }
            $vistos[$id] = true;
            $slots[] = ['id' => $id, 'rotulo' => $id, 'inicio' => $t, 'fim' => $tf];
        }
    }

    usort($slots, function ($a, $b) {
        return $a['inicio'] <=> $b['inicio'];
    });
    return $slots;
}

/** Primeiro e último dia que podem ser agendados. */
function agenda_janela(): array
{
    $hoje = agora()->setTime(0, 0);
    $limite = $hoje->modify('+' . (int) agenda_cfg()['dias_a_frente'] . ' days');
    return [$hoje, $limite];
}

/** Horário mais cedo que ainda pode ser agendado (agora + antecedência mínima). */
function agenda_inicio_minimo(): DateTimeImmutable
{
    return agora()->modify('+' . (int) agenda_cfg()['antecedencia_horas'] . ' hours');
}

/** O horário está livre? (antecedência + conflito com ocupados, considerando a margem) */
function agenda_slot_livre(array $slot, array $tipo, array $ocupados): bool
{
    if ($slot['inicio'] < agenda_inicio_minimo()) {
        return false;
    }
    $margem = (int) ($tipo['margem_minutos'] ?? 0);
    $ini = $slot['inicio']->modify("-{$margem} minutes");
    $fim = $slot['fim']->modify("+{$margem} minutes");
    foreach ($ocupados as [$oi, $of]) {
        if ($oi < $fim && $of > $ini) {
            return false;
        }
    }
    return true;
}

// ------------------------------------------------------------------ ocupados (+cache)

function agenda_limpar_cache(): void
{
    foreach (glob(storage('cache') . '/*.json') ?: [] as $f) {
        @unlink($f);
    }
}

/**
 * Intervalos ocupados entre $de e $ate.
 * Usa cache curto (agenda.cache_segundos) para não consultar o Google a cada visita.
 */
function agenda_ocupados(DateTimeImmutable $de, DateTimeImmutable $ate, bool $usarCache = true): array
{
    $ttl = (int) (agenda_cfg()['cache_segundos'] ?? 20);
    $arq = storage('cache') . '/' . md5($de->format('c') . $ate->format('c') . (modo_demo() ? 'd' : 'g')) . '.json';

    if ($usarCache && $ttl > 0 && is_readable($arq) && filemtime($arq) > time() - $ttl) {
        $lista = json_decode((string) file_get_contents($arq), true);
        if (is_array($lista)) {
            return array_map(function ($p) {
                return [new DateTimeImmutable($p[0]), new DateTimeImmutable($p[1])];
            }, $lista);
        }
    }

    $ocupados = modo_demo() ? demo_ocupados($de, $ate) : google_ocupados($de, $ate);

    @file_put_contents($arq, json_encode(array_map(function ($p) {
        return [$p[0]->format(DATE_ATOM), $p[1]->format(DATE_ATOM)];
    }, $ocupados)), LOCK_EX);

    return $ocupados;
}

// ------------------------------------------------------------------ modo demonstração

function demo_arquivo(): string
{
    return storage() . '/demo-agendamentos.json';
}

/** Agenda de exemplo: alguns compromissos fixos por dia + agendamentos feitos no modo demo. */
function demo_ocupados(DateTimeImmutable $de, DateTimeImmutable $ate): array
{
    $out = [];
    for ($d = $de->setTime(0, 0); $d <= $ate; $d = $d->modify('+1 day')) {
        $h = crc32('lv' . $d->format('Y-m-d')) % 7;
        if ($h === 0) {
            $out[] = [hora_no_dia($d, '18:00'), hora_no_dia($d, '19:30')];
        } elseif ($h === 1) {
            $out[] = [hora_no_dia($d, '12:00'), hora_no_dia($d, '13:00')];
        } elseif ($h === 2) {
            $out[] = [hora_no_dia($d, '19:00'), hora_no_dia($d, '20:30')];
        } elseif ($h === 3) {
            $out[] = [hora_no_dia($d, '09:00'), hora_no_dia($d, '10:30')];
        }
    }
    $salvas = is_readable(demo_arquivo()) ? json_decode((string) file_get_contents(demo_arquivo()), true) : [];
    foreach (is_array($salvas) ? $salvas : [] as $r) {
        $out[] = [new DateTimeImmutable($r['inicio']), new DateTimeImmutable($r['fim'])];
    }
    return $out;
}

function demo_registrar(DateTimeImmutable $inicio, DateTimeImmutable $fim, string $resumo): void
{
    $arq = demo_arquivo();
    $lista = is_readable($arq) ? json_decode((string) file_get_contents($arq), true) : [];
    $lista = is_array($lista) ? $lista : [];
    $lista[] = ['inicio' => $inicio->format(DATE_ATOM), 'fim' => $fim->format(DATE_ATOM), 'resumo' => $resumo];
    file_put_contents($arq, json_encode($lista, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
}
