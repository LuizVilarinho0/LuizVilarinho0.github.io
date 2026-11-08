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

// ---------- Agenda (API PHP) ----------

export interface AgendaTipo {
  id: string;
  rotulo: string;
  descricao: string;
  duracao: number;
}

export interface AgendaSlot {
  id: string;
  rotulo: string;
  inicio: string; // HH:MM
  fim: string; // HH:MM
  livre: boolean;
}

export interface AgendaResposta {
  ok: true;
  demo: boolean;
  timezone: string;
  atualizadoEm: string;
  hoje: string; // YYYY-MM-DD
  limite: string;
  tipos: AgendaTipo[];
  /** dias[YYYY-MM-DD][tipoId] = horários */
  dias: Record<string, Record<string, AgendaSlot[]>>;
}

export type Formato = 'online' | 'ligacao' | 'presencial';

export interface AgendamentoPedido {
  tipo: string;
  data: string;
  slot: string;
  nome: string;
  email: string;
  empresa?: string;
  telefone?: string;
  formato: Formato;
  pauta?: string;
  website?: string; // honeypot
}

export interface AgendamentoConfirmado {
  tipo: string;
  tipoRotulo: string;
  data: string;
  slot: string;
  inicio: string;
  fim: string;
  formato: Formato;
  linkReuniao: string;
}

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
