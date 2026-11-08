import type { Experiencia } from '../types';

/* Linha do tempo (igual ao currículo). `slug` liga a linha à página do trabalho. */
export const experiencias: Experiencia[] = [
  {
    periodo: 'set/2026 — atual',
    cargo: 'Analista de E-commerce',
    empresa: 'Nobre Brasil',
    detalhe: 'Tempo integral · Presencial',
    area: 'ecommerce',
    slug: 'nobre-brasil',
  },
  {
    periodo: 'set/2025 — atual',
    cargo: 'Proprietário',
    empresa: 'MLJ Store',
    detalhe: 'E-commerce próprio',
    area: 'ecommerce',
    slug: 'mlj-store',
  },
  {
    periodo: 'nov/2025 — jun/2026',
    cargo: 'Assistente de Tráfego Pago',
    empresa: 'Nova Singular',
    detalhe: 'Meta Ads · Google Ads',
    area: 'ecommerce',
    slug: 'nova-singular',
  },
  {
    periodo: 'jan/2023 — jun/2025',
    cargo: 'Assistente de E-commerce',
    empresa: 'TEC PRINT',
    detalhe: 'Comércio Online',
    area: 'ecommerce',
    slug: 'tec-print',
  },
  {
    periodo: 'jan/2024 — dez/2027',
    cargo: 'Bacharelado em Ciência da Computação',
    empresa: 'UNIP',
    detalhe: 'Em andamento',
    area: 'formacao',
  },
];

export const competencias: { grupo: string; area: 'ecommerce' | 'tech' | 'geral'; itens: string[] }[] = [
  {
    grupo: 'E-commerce',
    area: 'ecommerce',
    itens: ['Marketplaces', 'Catálogo e anúncios', 'Precificação', 'Estoque', 'Logística', 'Pós-venda', 'ERP Bling'],
  },
  {
    grupo: 'Marketing digital',
    area: 'ecommerce',
    itens: ['Tráfego pago', 'Meta Ads', 'Google Ads', 'Análise de campanhas'],
  },
  {
    grupo: 'Dados e tecnologia',
    area: 'tech',
    itens: ['Excel', 'SQL', 'MySQL', 'Business Intelligence', 'HTML5 e CSS3', 'JavaScript', 'TypeScript', 'React', 'Python', 'PHP', 'Automação de processos'],
  },
  {
    grupo: 'Gestão',
    area: 'geral',
    itens: ['Gestão financeira', 'Fluxo de caixa', 'Negociação com fornecedores', 'Atendimento ao cliente'],
  },
];

export const certificacoes = [
  'Administrando Banco de Dados: Business Intelligence, SQL Server, MySQL, Oracle, T-SQL e PL/SQL',
  'Microsoft Excel 2016 (básico)',
  'HTML5 e CSS3',
  'Manutenção de equipamentos de informática',
];

export const idiomas = 'Português (nativo) · Inglês (intermediário, B1)';

/** Palavras da faixa que corre na tela. */
export const faixa = [
  'Marketplaces',
  'React',
  'Meta Ads',
  'SQL',
  'Precificação',
  'TypeScript',
  'Google Ads',
  'Python',
  'Business Intelligence',
  'Catálogo',
  'PHP',
  'Pós-venda',
];
