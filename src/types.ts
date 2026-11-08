// ---------- Portfólio ----------

export type Area = 'ecommerce' | 'tech';

export type Capa =
  | { tipo: 'imagem'; src: string; alt: string }
  | { tipo: 'arte'; arte: 'funil' | 'catalogo' | 'ads' | 'marketplaces' | 'terminal' };

export interface Projeto {
  slug: string;
  area: Area;
  titulo: string;
  /** subtítulo curto que aparece no card */
  chamada: string;
  periodo: string;
  ano: number;
  papel: string;
  tags: string[];
  stack: string[];
  capa: Capa;
  /** cor de fundo da capa / detalhe da página */
  cor: string;
  contexto: string;
  feitos: string[];
  aprendizados: string;
  links?: { site?: string; github?: string };
  destaque?: boolean;
}

export interface Experiencia {
  periodo: string;
  cargo: string;
  empresa: string;
  detalhe: string;
  area: Area | 'formacao';
  slug?: string;
}

// ---------- Contato ----------

export interface ContatoPedido {
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  assunto: string;
  mensagem: string;
  website?: string; // honeypot
  t?: number; // tempo de preenchimento (anti-robô)
}
