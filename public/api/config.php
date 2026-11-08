<?php
/**
 * =============================================================
 *  CONFIGURAÇÃO DO BACKEND — Portfólio Luiz Vilarinho
 *  (formulário de contato com envio para o seu e-mail)
 *  O acesso direto pelo navegador é bloqueado pelo .htaccess.
 *  Segredos (senha do e-mail) ficam em config.local.php — veja config.local.exemplo.php.
 * =============================================================
 */

return [

    'timezone' => 'America/Sao_Paulo',

    // ---------------------------------------------------------------- Anti-abuso
    'limites' => [
        'contatos_por_hora' => 5,  // por IP
    ],

    // ---------------------------------------------------------------- E-mail
    'email' => [
        'destinatario'   => 'luizvilarinho948@gmail.com', // onde você recebe as mensagens
        'remetente'      => 'luizvilarinho948@gmail.com', // com Gmail SMTP, use o mesmo Gmail do 'usuario'
        'remetente_nome' => 'Luiz Vilarinho · Portfólio',

        // Mandar um "recebi sua mensagem" para quem usou o formulário?
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
