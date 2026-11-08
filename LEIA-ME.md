# Portfólio Luiz Vilarinho — v2

Site em **React + TypeScript** (Vite) com backend em **PHP** para o formulário de contato (envio para o
seu e-mail). Publicado no **GitHub Pages** (modo estático) e pronto para hospedagem com PHP (Hostinger).

```
portfolio/
├── index.html              ← página base (o React monta tudo aqui) + SEO
├── src/                    ← código do site (TypeScript + CSS)
│   ├── config.ts           ← ★ WhatsApp, e-mail, redes sociais, currículo
│   ├── data/
│   │   ├── projetos.ts     ← ★ trabalhos (e-commerce + tecnologia)
│   │   └── perfil.ts       ← ★ experiências, competências, certificações
│   ├── pages/              ← uma página por arquivo (Home, Trabalhos, Projeto, Contato)
│   ├── components/         ← peças reutilizáveis (logo, menu, faixas, capas, painel do topo…)
│   └── styles/             ← CSS (cores e fontes em styles/base.css)
├── public/                 ← vai para o servidor do jeito que está
│   ├── .htaccess           ← rotas + redireciona os endereços do site antigo (Hostinger)
│   ├── images/             ← prints dos projetos e imagem de compartilhamento
│   ├── curriculo/          ← ★ seu currículo em PDF
│   └── api/                ← BACKEND PHP (só na Hostinger)
│       ├── config.php      ← ★ e-mail/SMTP (a senha vai em config.local.php)
│       ├── contato.php     ← POST: envia o formulário para o seu e-mail
│       ├── status.php      ← diagnóstico da instalação
│       └── vendor/         ← PHPMailer (já incluído)
├── .github/workflows/      ← publicação automática no GitHub Pages
└── scripts/
    ├── mockApi.ts          ← API de demonstração usada no `npm run dev`
    └── router.php          ← para testar o site pronto localmente com PHP
```

★ = arquivos que você vai editar.

> A pasta `Novo-Portif-lio-Luiz-Vilarinho-main/` é o site antigo (HTML/CSS). Ela não vai para o Git e
> pode ser apagada quando você quiser.

---

## 1. Rodar no seu computador

Precisa do **Node.js 20 ou mais novo** (https://nodejs.org).

```bash
npm install      # só na primeira vez
npm run dev      # abre em http://localhost:5173
```

O `npm run dev` já vem com uma **API de demonstração**: o formulário funciona sem PHP e as mensagens
aparecem no terminal.

---

## 2. GitHub Pages (grátis, sem PHP)

O repositório **LuizVilarinho0.github.io** publica sozinho a cada `git push` na branch `main`
(workflow em `.github/workflows/deploy.yml`). O site fica em **https://luizvilarinho0.github.io**.

Para publicar uma alteração:

```bash
git add -A
git commit -m "Atualiza o portfólio"
git push
```

Em 1–2 minutos o site atualiza (acompanhe na aba **Actions** do repositório).

Como o Pages não roda PHP, o build usa o **modo estático** (`VITE_ESTATICO=1`): o formulário é enviado
pelo **FormSubmit**. Na primeira mensagem, o FormSubmit manda um e-mail para luizvilarinho948@gmail.com
pedindo confirmação: clique em **"Activate Form"** e pronto, as próximas chegam direto.

---

## 3. Hostinger (ou qualquer hospedagem com PHP)

Com PHP, o formulário envia pelo seu próprio Gmail e quem escreveu recebe uma resposta automática.

### Senha do Gmail

1. Ative a **verificação em duas etapas**: https://myaccount.google.com/security
2. Crie uma senha de app: https://myaccount.google.com/apppasswords (nome: "Portfólio").
3. Em `public/api/`, copie `config.local.exemplo.php` para **`config.local.php`** e cole os 16 caracteres
   em `'senha'` (sem espaços).

O `config.local.php` fica **fora do Git** (seu repositório é público) e é bloqueado para o navegador.
**Nunca** coloque a senha no `config.php`.

### Publicar

```bash
npm run build
```

Envie **todo o conteúdo da pasta `dist/`** (inclusive o `.htaccess` e a pasta `api/`, com o seu
`config.local.php`) para a pasta `public_html/`. Atalho: o arquivo `portfolio-luiz-vilarinho-hostinger.zip`
já tem o `dist/` pronto, é só enviar e usar "Extrair" no Gerenciador de Arquivos. Depois:

1. Confira se a pasta `api/storage/` tem permissão de escrita (755 ou 775).
2. Ative o SSL (HTTPS) no painel e descomente as 2 linhas de HTTPS no `.htaccess`.
3. Opcional: coloque uma senha em `chave_diagnostico` (no `config.local.php`) e abra
   `/api/status.php?chave=SUA_SENHA&teste_email=1` para testar o envio de e-mail.

Para testar o site pronto no seu PC (igual à hospedagem): `php -S localhost:8080 -t dist scripts/router.php`

---

## 4. Editando o conteúdo

| O quê | Onde |
|---|---|
| WhatsApp, e-mail, redes, currículo, selo "aberto a oportunidades" | `src/config.ts` |
| Trabalhos e cases (textos, capas, links, destaque na home) | `src/data/projetos.ts` |
| Experiências, competências, certificações | `src/data/perfil.ts` |
| Textos da página inicial (título, sobre, chamadas) | `src/pages/Home.tsx` |
| Painel animado do topo (gráfico + terminal) | `src/components/HeroVisual.tsx` |
| E-mail que recebe as mensagens (Hostinger) | `public/api/config.php` |
| Cores e fontes | `src/styles/base.css` (`:root`) |
| Currículo em PDF | substitua `public/curriculo/Luiz_Vilarinho_Curriculo_2026.pdf` (mesmo nome) |

**Adicionar um trabalho com print:** salve a imagem (1440×900, de preferência `.webp`) em
`public/images/projetos/` e use `capa: { tipo: 'imagem', src: '/images/projetos/arquivo.webp', alt: '...' }`.

---

## 5. A marca

O monograma **LV**: o "L" e o braço direito do "V" formam uma única linha em "taco de hóquei" (o gráfico
de crescimento) que termina numa seta. Vendas subindo (e-commerce) + traço geométrico e preciso (tecnologia).

- `public/logo.svg`: logo para fundo escuro · `public/favicon.svg`: ícone (laranja)
- Paleta: tinta `#0E0E0D` · papel `#F1EEE7` · laranja `#FF6A2B` (e-commerce) · água `#2BE4C8` (tecnologia)
- Fontes: Archivo (títulos expandidos), Instrument Serif (palavras em itálico), JetBrains Mono (detalhes)
