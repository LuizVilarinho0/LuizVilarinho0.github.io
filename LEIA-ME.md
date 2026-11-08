# Portfólio Luiz Vilarinho — v2

Site em **React + TypeScript** (Vite) com backend em **PHP** para o formulário de contato (envio para o seu
e-mail) e para a agenda de entrevistas ligada ao **Google Agenda**.

```
portfolio/
├── index.html              ← página base (o React monta tudo aqui) + SEO
├── src/                    ← código do site (TypeScript + CSS)
│   ├── config.ts           ← ★ WhatsApp, e-mail, redes sociais, currículo
│   ├── data/
│   │   ├── projetos.ts     ← ★ trabalhos (e-commerce + tecnologia) e laboratório
│   │   └── perfil.ts       ← ★ experiências, competências, certificações
│   ├── pages/              ← uma página por arquivo (Home, Trabalhos, Projeto, Agendar, Contato)
│   ├── components/         ← peças reutilizáveis (logo, menu, cursor, faixas, capas…)
│   └── styles/             ← CSS (cores e fontes em styles/base.css)
├── public/                 ← vai para o servidor do jeito que está
│   ├── .htaccess           ← rotas + redireciona os endereços do site antigo
│   ├── images/             ← sua foto, prints dos projetos, imagem de compartilhamento
│   ├── curriculo/          ← ★ seu currículo em PDF
│   └── api/                ← ★ BACKEND PHP
│       ├── config.php      ← ★ Google Agenda, horários disponíveis, e-mail/SMTP
│       ├── agenda.php      ← GET: horários livres/ocupados
│       ├── agendar.php     ← POST: cria a reunião no Google Agenda + e-mails
│       ├── contato.php     ← POST: envia o formulário para o seu e-mail
│       ├── status.php      ← diagnóstico da instalação
│       ├── vendor/         ← PHPMailer (já incluído)
│       ├── private/        ← credencial do Google (bloqueada para o navegador)
│       └── storage/        ← cache e limites (precisa ser gravável)
└── scripts/
    ├── mockApi.ts          ← API de demonstração usada no `npm run dev`
    └── router.php          ← para testar o site pronto localmente com PHP
```

★ = arquivos que você vai editar.

> A pasta `Novo-Portif-lio-Luiz-Vilarinho-main/` é o site antigo (HTML/CSS). Ela não é usada pelo
> site novo e pode ser apagada quando você quiser.

---

## 1. Rodar no seu computador

Precisa do **Node.js 20 ou mais novo** (https://nodejs.org).

```bash
npm install      # só na primeira vez
npm run dev      # abre em http://localhost:5173
```

O `npm run dev` já vem com uma **API de demonstração** embutida: a agenda e o formulário funcionam sem
PHP (os dados aparecem no terminal). Para testar com o PHP de verdade (precisa do PHP 8 instalado:
https://windows.php.net/download):

```bash
npm run php      # terminal 1: API PHP em http://localhost:8000
npm run dev:php  # terminal 2: site em http://localhost:5173 usando o PHP
```

---

## 2. Receber os e-mails no seu Gmail (formulário + avisos de agendamento)

O site envia pelo próprio Gmail usando uma **senha de app** (não é a sua senha normal):

1. Ative a **verificação em duas etapas**: https://myaccount.google.com/security
2. Crie uma senha de app: https://myaccount.google.com/apppasswords (nome: "Portfólio").
3. Em `public/api/`, copie `config.local.exemplo.php` para **`config.local.php`** e cole os 16
   caracteres:
   ```php
   'email' => [
       'smtp' => [
           'senha' => 'abcdefghijklmnop',   // ← aqui (sem espaços)
       ],
   ],
   ```
   O `config.local.php` guarda só os segredos: ele substitui os valores do `config.php`, fica **fora
   do Git** (seu repositório no GitHub é público) e é bloqueado para o navegador. O resto da
   configuração do Gmail (servidor `smtp.gmail.com`, porta 587, usuário) já está no `config.php`.

Pronto: as mensagens do formulário chegam em `luizvilarinho948@gmail.com` com "Responder" apontando
para quem escreveu, e a pessoa recebe uma resposta automática. Para desligar a resposta automática:
`'resposta_automatica' => false`.

> **Nunca** coloque a senha direto no `config.php` (ele vai para o GitHub). Use sempre o `config.local.php`.
> Na hospedagem, envie o `config.local.php` junto com o resto da pasta `api/`.

---

## 3. Ligar a agenda ao seu Google Agenda

O site usa uma **conta de serviço**: um "robô" do Google que você autoriza a ver e criar eventos na sua agenda.

1. Acesse https://console.cloud.google.com e crie um projeto (ex.: `portfolio-luiz`).
2. **APIs e serviços → Biblioteca** → procure **Google Calendar API** → **Ativar**.
3. **APIs e serviços → Credenciais → Criar credenciais → Conta de serviço**. Dê um nome
   (ex.: `agenda-site`) e conclua (não precisa dar papéis).
4. Abra a conta de serviço → aba **Chaves → Adicionar chave → Criar nova chave → JSON**.
5. Renomeie o arquivo baixado para **`google-service-account.json`** e coloque em
   `public/api/private/` (no servidor: `api/private/`).
6. Copie o e-mail da conta de serviço (algo como `agenda-site@portfolio-luiz.iam.gserviceaccount.com`).
7. No **Google Agenda** (no computador): ⚙️ **Configurações** → clique na sua agenda à esquerda →
   **Compartilhar com pessoas e grupos específicos → Adicionar pessoas** → cole o e-mail da conta de
   serviço → permissão **"Fazer alterações nos eventos"** → Enviar.
8. Na mesma tela, em **Integrar agenda**, confira o **ID da agenda** (na principal é o seu Gmail).
9. Em `public/api/config.php`:
   ```php
   'modo_demo' => false,
   'google' => [
       'calendar_id' => 'luizvilarinho948@gmail.com',   // o ID do passo 8
       ...
   ```
10. Teste: coloque uma senha em `'chave_diagnostico' => 'qualquer-senha-longa'` e abra
    `https://seusite.com.br/api/status.php?chave=qualquer-senha-longa` (acrescente `&teste_email=1`
    para mandar um e-mail de teste). Tudo deve aparecer com `"ok": true`. Depois apague a chave (`''`).

### Como a agenda funciona

- O site mostra horários livres conforme as **janelas** do `config.php`. O padrão é:
  seg–sex 12:00–13:00 e 18:00–20:30, sábado 09:00–12:00. **Ajuste aos seus horários reais.**
- **Qualquer** compromisso na sua agenda (trabalho, faculdade, pessoal) bloqueia o horário no site.
  Os detalhes nunca aparecem, só "ocupado". Eventos marcados como **"Disponível"** não bloqueiam.
- Tipos: **Entrevista** (45 min) e **Bate-papo / Projeto** (30 min), com horários a cada 30 min.
- Quando alguém agenda, o site confere de novo direto no Google, cria o evento
  **"Entrevista · Nome (Empresa)"** (cor tangerina) com e-mail, telefone, formato e pauta, manda um
  aviso para você e uma confirmação para a pessoa. Ela ainda pode salvar no Google Agenda dela ou
  baixar o `.ics`.
- **Link da chamada:** se você tiver um link fixo (sala do Google Meet, Zoom…), coloque em
  `'reuniao' => ['link_online' => '...']` e ele vai junto na confirmação. Sem link, a confirmação diz
  que você enviará o link por e-mail. (O Google não permite que a conta de serviço gere links do Meet
  nem convide pessoas numa conta Gmail comum; se quiser um convite oficial, abra o evento e adicione o
  e-mail da pessoa como convidado.)
- **Para cancelar:** apague o evento no Google Agenda e avise a pessoa por e-mail.
- A página se atualiza sozinha a cada 30 s (ajuste em `src/config.ts` → `agendaAtualizaMs`).

---

## 4. Publicar (Hostinger ou qualquer hospedagem com PHP)

Requisitos: **PHP 7.4+** (ideal 8.1+) com `curl` e `openssl`, e Apache/LiteSpeed com `.htaccess`.
Não precisa de banco de dados.

```bash
npm run build
```

Envie **todo o conteúdo da pasta `dist/`** (inclusive o `.htaccess` e a pasta `api/`) para a pasta
`public_html/` pelo Gerenciador de Arquivos ou FTP. Atalho: o arquivo
`portfolio-luiz-vilarinho-hostinger.zip` já tem o `dist/` pronto. Envie e use "Extrair" no
Gerenciador de Arquivos da Hostinger (se editar algo, rode o build e envie de novo). Depois:

1. Envie também `api/private/google-service-account.json` (se ainda não estiver lá).
2. Confira se a pasta `api/storage/` tem permissão de escrita (755 ou 775).
3. Ative o SSL (HTTPS) no painel e descomente as 2 linhas de HTTPS no `.htaccess`.
4. Acesse `/api/status.php?chave=...` para conferir (passo 3.10).

> Netlify/Vercel não rodam PHP: para a agenda e o formulário funcionarem, use uma hospedagem com PHP.

Para testar o site **pronto** no seu PC (igual à hospedagem):
`php -S localhost:8080 -t dist scripts/router.php`

---

## 5. Editando o conteúdo

| O quê | Onde |
|---|---|
| WhatsApp, e-mail, redes, currículo, selo "disponível" | `src/config.ts` |
| Trabalhos e cases (textos, capas, links, destaque na home) | `src/data/projetos.ts` |
| Experiências, competências, certificações | `src/data/perfil.ts` |
| Textos da página inicial (título, sobre, chamadas) | `src/pages/Home.tsx` |
| Horários disponíveis, tipos de reunião, e-mail | `public/api/config.php` |
| Cores e fontes | `src/styles/base.css` (`:root`) |
| Currículo em PDF | substitua `public/curriculo/Luiz_Vilarinho_Curriculo_2026.pdf` (mesmo nome) |

**Adicionar um trabalho com print:** salve a imagem (1440×900, de preferência `.webp`) em
`public/images/projetos/` e use `capa: { tipo: 'imagem', src: '/images/projetos/arquivo.webp', alt: '...' }`.

Depois de editar, rode `npm run build` e envie a pasta `dist/` de novo.

---

## 6. A marca

O monograma **LV** foi redesenhado: o "L" e o braço direito do "V" formam uma única linha em "taco de
hóquei" (o gráfico de crescimento) que termina numa seta. É o encontro das suas duas áreas:
vendas subindo (e-commerce) e traço geométrico e preciso (tecnologia).

- `public/logo.svg`: logo para fundo escuro · `public/favicon.svg`: ícone (laranja)
- Paleta: tinta `#0E0E0D` · papel `#F1EEE7` · laranja `#FF6A2B` (e-commerce) · água `#2BE4C8` (tecnologia)
- Fontes: Archivo (títulos expandidos), Instrument Serif (palavras em itálico), JetBrains Mono (detalhes)
