import type { Projeto } from '../types';

/*
 * TRABALHOS DO PORTFÓLIO
 * - area: 'ecommerce' ou 'tech' (define o filtro e a cor do selo)
 * - capa: { tipo: 'imagem', src: '/images/projetos/arquivo.webp', alt } — ou uma 'arte' pronta
 * - destaque: true → aparece na página inicial
 * A ordem aqui é a ordem no site.
 */
export const projetos: Projeto[] = [
  {
    slug: 'mlj-store',
    area: 'ecommerce',
    titulo: 'MLJ Store',
    chamada: 'Meu próprio e-commerce, de ponta a ponta',
    periodo: 'set/2025 — atual',
    ano: 2025,
    papel: 'Proprietário',
    tags: ['Operação', 'Finanças', 'Marketing', 'Pós-venda'],
    stack: ['Marketplaces', 'Precificação', 'Fluxo de caixa', 'Campanhas digitais', 'Automação de processos'],
    capa: { tipo: 'arte', arte: 'funil' },
    cor: '#FF6A2B',
    contexto:
      'A MLJ Store é o meu e-commerce. Aqui não existe "não é comigo": eu planejo as vendas nos marketplaces, compro, precifico, anuncio, despacho e atendo. É onde eu testo na prática tudo o que aprendo sobre vender online, com o meu próprio dinheiro em jogo.',
    feitos: [
      'Gestão estratégica e operacional do negócio, do planejamento de vendas em marketplaces ao pós-venda',
      'Gestão financeira: fluxo de caixa, precificação e controle de margem',
      'Negociação com fornecedores e gestão de estoque',
      'Planejamento e acompanhamento de campanhas de marketing digital',
      'Análise de faturamento, conversão, ticket médio e margem para guiar as decisões comerciais',
      'Implementação de processos e automações para ganhar eficiência na operação',
      'Gestão de logística, atendimento e experiência do cliente',
    ],
    aprendizados:
      'Ter a própria loja mudou a forma como eu olho para um anúncio: cada decisão de preço, frete ou campanha aparece na margem no fim do mês. É a visão de dono que eu levo para qualquer operação.',
    destaque: true,
  },
  {
    slug: 'site-ro-vilari',
    area: 'tech',
    titulo: 'Site Rô Vilari',
    chamada: 'Site de cantora com agenda conectada ao Google',
    periodo: '2026',
    ano: 2026,
    papel: 'Design e desenvolvimento',
    tags: ['Web design', 'Front-end', 'Back-end'],
    stack: ['React', 'TypeScript', 'Vite', 'Framer Motion', 'PHP', 'Google Calendar API', 'Web Audio API'],
    capa: { tipo: 'imagem', src: '/images/projetos/rovilari.webp', alt: 'Página inicial do site da cantora Rô Vilari' },
    cor: '#FBEFDF',
    contexto:
      'A Rô Vilari é cantora em Ribeirão Preto e canta de samba a rock. O site antigo era estático e não ajudava a fechar shows. O objetivo: um site com a energia de um show ao vivo e que deixasse o contratante reservar a data sozinho.',
    feitos: [
      'Identidade visual com uma cor e um ritmo próprios para cada um dos 12 gêneros musicais',
      'Mesa de ritmos tocável no navegador, com o som gerado em tempo real pela Web Audio API',
      'Agenda de shows ligada ao Google Agenda: o visitante vê os horários livres e faz a pré-reserva',
      'Back-end em PHP sem dependências: autenticação com o Google por conta de serviço, cache e limite de tentativas',
      'Formulário de contato com envio por SMTP e proteção contra robôs',
    ],
    aprendizados:
      'Foi o projeto em que juntei front-end, back-end e integração com API externa num produto real, para uma cliente real, publicado em hospedagem compartilhada.',
    destaque: true,
  },
  {
    slug: 'nobre-brasil',
    area: 'ecommerce',
    titulo: 'Nobre Brasil',
    chamada: 'Catálogo e anúncios com foco em conversão',
    periodo: 'set/2026 — atual',
    ano: 2026,
    papel: 'Analista de E-commerce',
    tags: ['Marketplaces', 'Catálogo', 'Preço', 'Indicadores'],
    stack: ['Gestão de anúncios', 'Catálogo', 'Competitividade de preço', 'Indicadores de venda', 'Estoque'],
    capa: { tipo: 'arte', arte: 'catalogo' },
    cor: '#F1EEE7',
    contexto:
      'Na Nobre Brasil atuo em tempo integral, de forma presencial, como analista de e-commerce. Meu foco é o que o cliente vê no marketplace: anúncio bem feito, catálogo organizado e preço competitivo.',
    feitos: [
      'Gestão de anúncios e catálogo em marketplaces, com foco em conversão e competitividade de preço',
      'Acompanhamento de indicadores de vendas, estoque e desempenho comercial',
      'Apoio às rotinas operacionais do e-commerce e à experiência do cliente',
    ],
    aprendizados:
      'Escala muda tudo: com um catálogo grande, pequenos ajustes de título, foto e preço, repetidos com método, viram resultado.',
    destaque: true,
  },

  {
    slug: 'nova-singular',
    area: 'ecommerce',
    titulo: 'Nova Singular',
    chamada: 'Campanhas de Meta Ads e Google Ads no dia a dia',
    periodo: 'nov/2025 — jun/2026',
    ano: 2025,
    papel: 'Assistente de Tráfego Pago',
    tags: ['Tráfego pago', 'Meta Ads', 'Google Ads'],
    stack: ['Meta Ads', 'Google Ads', 'Análise de desempenho', 'Otimização de campanhas', 'Atendimento'],
    capa: { tipo: 'arte', arte: 'ads' },
    cor: '#141414',
    contexto:
      'Na agência Nova Singular, dei suporte à gestão de tráfego pago dos clientes, acompanhando as campanhas de perto e ajudando nas decisões de otimização.',
    feitos: [
      'Acompanhamento diário de campanhas em Meta Ads e Google Ads',
      'Apoio em otimizações de campanhas e análise de desempenho',
      'Atendimento ao cliente e suporte à gestão de tráfego pago',
    ],
    aprendizados:
      'Aprendi a ler os números de uma campanha e a conectar o clique com a venda: o mesmo raciocínio que uso para avaliar anúncios em marketplace.',
    destaque: true,
  },

  {
    slug: 'tec-print',
    area: 'ecommerce',
    titulo: 'TEC PRINT',
    chamada: 'Lojas na Shopee, Magalu e B2W integradas ao Bling',
    periodo: 'jan/2023 — jun/2025',
    ano: 2023,
    papel: 'Assistente de E-commerce',
    tags: ['Marketplaces', 'Estoque', 'ERP Bling'],
    stack: ['Shopee', 'Magalu', 'B2W', 'Bling', 'Emissão de NF-e', 'Controle de estoque'],
    capa: { tipo: 'arte', arte: 'marketplaces' },
    cor: '#FF6A2B',
    contexto:
      'Foi na TEC PRINT, comércio online, que comecei no e-commerce. Por dois anos e meio cuidei das lojas da empresa em vários marketplaces, com a operação integrada pelo ERP Bling.',
    feitos: [
      'Cadastro e gestão de produtos e anúncios na Shopee, Magalu e B2W',
      'Controle de estoque e atualização constante de preços',
      'Uso avançado do Bling: pedidos, estoque, emissão de notas fiscais e integração com os marketplaces',
      'Atendimento ao cliente e acompanhamento dos resultados de vendas',
    ],
    aprendizados: 'A base de tudo: entender a operação por dentro, do cadastro do anúncio à nota fiscal.',
  },

  {
    slug: 'file-organizer',
    area: 'tech',
    titulo: 'File Organizer',
    chamada: 'Automação em Python que organiza pastas sozinha',
    periodo: '2026',
    ano: 2026,
    papel: 'Desenvolvimento',
    tags: ['Automação', 'CLI', 'Testes'],
    stack: ['Python', 'pytest', 'mypy --strict', 'argparse'],
    capa: { tipo: 'arte', arte: 'terminal' },
    cor: '#101210',
    contexto:
      'A pasta de Downloads de todo mundo vira bagunça. Esse script organiza os arquivos de um diretório em subpastas por categoria: imagens, documentos, vídeos, áudio, código…',
    feitos: [
      'Tipagem completa e configuração mypy --strict',
      'Testes com pytest cobrindo a lógica central, a CLI e os casos de borda',
      'Modo --dry-run, que simula a organização sem tocar no disco',
      'Tratamento de nomes repetidos (foto.png → foto (1).png), sem dependências externas',
    ],
    aprendizados: 'Automação é o que mais conecta as minhas duas áreas: tirar tarefas repetitivas da frente para sobrar tempo para decidir.',
    links: { github: 'https://github.com/LuizVilarinho0/File-Organizer-Automa-o-de-Arquivos' },
  },
];

export const areaRotulo = { ecommerce: 'E-commerce', tech: 'Tecnologia' } as const;
