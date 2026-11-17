// ---------- Portfólio ----------

export type Area = 'ecommerce' | 'tech';

export type Capa =
  | { tipo: 'imagem'; src: string; alt: string }
  | { tipo: 'arte'; arte: 'funil' | 'catalogo' | 'ads' | 'marketplaces' | 'terminal' | 'embarque' | 'vigia' };

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
  /** id de um vídeo do YouTube (ex.: 'lbcazQpTB08') mostrado na página do projeto */
  video?: { youtube: string; titulo: string };
  /** imagens extras (prints de código, telas) mostradas na página do projeto */
  galeria?: { src: string; alt: string; legenda: string }[];
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
