<?php
/**
 * =============================================================
 *  CONFIGURAÇÃO DO BACKEND — Portfólio Luiz Vilarinho
 *  Este é o único arquivo PHP que você precisa editar.
 *  (O acesso direto pelo navegador é bloqueado pelo .htaccess.)
 * =============================================================
 */

return [

    'timezone' => 'America/Sao_Paulo',

    /*
     * MODO DEMONSTRAÇÃO
     * true  = a agenda usa compromissos de exemplo e grava os agendamentos em storage/ (para testar)
     * false = a agenda usa o seu Google Agenda de verdade (configure 'google' abaixo)
     */
    'modo_demo' => true,

    // ---------------------------------------------------------------- Google Agenda
    'google' => [
        // ID da agenda. Na agenda principal, é o próprio Gmail.
        // Google Agenda > Configurações > (sua agenda) > "Integrar agenda" > ID da agenda
        'calendar_id' => 'luizvilarinho948@gmail.com',

        // Arquivo JSON da "conta de serviço" baixado do Google Cloud (veja o LEIA-ME).
        'credenciais' => __DIR__ . '/private/google-service-account.json',
    ],

    // ---------------------------------------------------------------- Regras da agenda
    'agenda' => [
        'dias_a_frente'      => 60,   // até quantos dias no futuro aceitar agendamentos
        'antecedencia_horas' => 12,   // só aceita horários com pelo menos X horas de antecedência
        'cache_segundos'     => 20,   // evita consultar o Google a cada visita
        'datas_bloqueadas'   => [     // feriados, férias, provas... (formato AAAA-MM-DD)
            // '2026-12-25',
        ],

        /*
         * TIPOS DE CONVERSA
         * duracao_minutos: quanto tempo a reunião ocupa na agenda
         * passo_minutos:   de quanto em quanto tempo os horários começam (ex.: 30 → 18:00, 18:30, 19:00…)
         * janelas:         quando você está disponível. dias: 0 = domingo, 1 = segunda … 6 = sábado
         * margem_minutos:  folga antes/depois que também precisa estar livre
         *
         * ★ Ajuste as janelas aos seus horários reais. Qualquer compromisso no seu
         *   Google Agenda (trabalho, faculdade, pessoal) bloqueia o horário automaticamente.
         */
        'tipos' => [
            'entrevista' => [
                'rotulo'          => 'Reunião',
                'descricao'       => 'Entrevista, processo seletivo ou reunião de trabalho. Online, por ligação ou presencial.',
                'modo'            => 'horario',
                'duracao_minutos' => 45,
                'passo_minutos'   => 30,
                'margem_minutos'  => 0,
                'janelas' => [
                    ['dias' => [1, 2, 3, 4, 5], 'inicio' => '12:00', 'fim' => '13:00'], // almoço
                    ['dias' => [1, 2, 3, 4, 5], 'inicio' => '18:00', 'fim' => '20:30'], // depois do expediente
                    ['dias' => [6],             'inicio' => '09:00', 'fim' => '12:00'], // sábado de manhã
                ],
            ],
            'conversa' => [
                'rotulo'          => 'Bate-papo',
                'descricao'       => 'Uma conversa rápida e informal para a gente se conhecer.',
                'modo'            => 'horario',
                'duracao_minutos' => 30,
                'passo_minutos'   => 30,
                'margem_minutos'  => 0,
                'janelas' => [
                    ['dias' => [1, 2, 3, 4, 5], 'inicio' => '12:00', 'fim' => '13:00'],
                    ['dias' => [1, 2, 3, 4, 5], 'inicio' => '18:00', 'fim' => '20:30'],
                    ['dias' => [6],             'inicio' => '09:00', 'fim' => '12:00'],
                ],
            ],
        ],
    ],

    // ---------------------------------------------------------------- Reunião online
    'reuniao' => [
        /*
         * Link fixo de chamada (opcional). Ex.: sua sala pessoal do Google Meet
         * (crie em meet.google.com → "Criar uma reunião para depois") ou do Zoom/Teams.
         * Vazio = a confirmação diz que você enviará o link por e-mail.
         */
        'link_online' => '',
        'endereco_presencial' => 'Ribeirão Preto · SP (endereço combinado por e-mail)',
    ],

    // ---------------------------------------------------------------- Evento criado no Google
    'evento' => [
        // Cores do Google Agenda: 1 lavanda, 2 sálvia, 3 uva, 4 flamingo, 5 banana,
        // 6 tangerina, 7 pavão, 8 grafite, 9 mirtilo, 10 manjericão, 11 tomate
        'cor' => '6',
    ],

    // ---------------------------------------------------------------- Anti-abuso
    'limites' => [
        'agendamentos_por_hora' => 3,  // por IP
        'contatos_por_hora'     => 5,  // por IP
    ],

    // ---------------------------------------------------------------- E-mail
    'email' => [
        'destinatario'   => 'luizvilarinho948@gmail.com', // onde você recebe as mensagens e os avisos
        'remetente'      => 'luizvilarinho948@gmail.com', // com Gmail SMTP, use o mesmo Gmail do 'usuario'
        'remetente_nome' => 'Luiz Vilarinho · Portfólio',

        // Avisar você por e-mail a cada novo agendamento?
        'avisar_agendamentos' => true,
        // Mandar confirmação para quem agendou?
        'confirmar_para_visitante' => true,
        // Mandar um "recebi sua mensagem" para quem usou o formulário de contato?
        'resposta_automatica' => true,

        /*
         * SMTP (recomendado). Funciona com Gmail usando uma SENHA DE APP:
         *   1. Ative a verificação em 2 etapas: https://myaccount.google.com/security
         *   2. Crie a senha de app: https://myaccount.google.com/apppasswords
         *   3. Cole os 16 caracteres em config.local.php (copie de config.local.exemplo.php).
         *      NÃO coloque a senha aqui: este arquivo vai para o GitHub.
         * Enquanto a senha estiver vazia, o site usa a função mail() do PHP (pode cair no spam).
         *
         * Usando um e-mail do seu domínio na Hostinger:
         *   host smtp.hostinger.com · porta 465 · seguranca 'ssl'
         */
        'smtp' => [
            'ativo'     => true,
            'host'      => 'smtp.gmail.com',
            'porta'     => 587,
            'seguranca' => 'tls', // 'tls' (porta 587) ou 'ssl' (porta 465)
            'usuario'   => 'luizvilarinho948@gmail.com',
            'senha'     => '',
        ],
    ],

    /*
     * Diagnóstico: acesse /api/status.php?chave=SUA_CHAVE para checar se está tudo certo.
     * Deixe vazio ('') para desativar.
     */
    'chave_diagnostico' => '',
];
