/**
 * API DE DEMONSTRAÇÃO (só no `npm run dev`)
 *
 * Imita os endpoints PHP de public/api para você ver o site funcionando sem
 * instalar PHP. Nada aqui vai para o build. As regras espelham o config.php.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

interface Janela {
  dias: number[];
  inicio: string;
  fim: string;
}
interface Tipo {
  id: string;
  rotulo: string;
  descricao: string;
  duracao: number;
  passo: number;
  janelas: Janela[];
}

const JANELAS: Janela[] = [
  { dias: [1, 2, 3, 4, 5], inicio: '12:00', fim: '13:00' },
  { dias: [1, 2, 3, 4, 5], inicio: '18:00', fim: '20:30' },
  { dias: [6], inicio: '09:00', fim: '12:00' },
];

const TIPOS: Tipo[] = [
  {
    id: 'entrevista',
    rotulo: 'Reunião',
    descricao: 'Entrevista, processo seletivo ou reunião de trabalho. Online, por ligação ou presencial.',
    duracao: 45,
    passo: 30,
    janelas: JANELAS,
  },
  {
    id: 'conversa',
    rotulo: 'Bate-papo',
    descricao: 'Uma conversa rápida e informal para a gente se conhecer.',
    duracao: 30,
    passo: 30,
    janelas: JANELAS,
  },
];

const DIAS_A_FRENTE = 60;
const ANTECEDENCIA_H = 12;
const reservas: { inicio: number; fim: number }[] = [];

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const at = (dia: Date, h: string) => {
  const [hh, mm] = h.split(':').map(Number);
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), hh, mm);
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Compromissos "falsos" fixos por dia, para a agenda de exemplo parecer real. */
function ocupadosDoDia(dia: Date): { inicio: number; fim: number }[] {
  const h = hash('lv' + iso(dia)) % 7;
  const out: { inicio: number; fim: number }[] = [];
  if (h === 0) out.push({ inicio: +at(dia, '18:00'), fim: +at(dia, '19:30') });
  if (h === 1) out.push({ inicio: +at(dia, '12:00'), fim: +at(dia, '13:00') });
  if (h === 2) out.push({ inicio: +at(dia, '19:00'), fim: +at(dia, '20:30') });
  if (h === 3) out.push({ inicio: +at(dia, '09:00'), fim: +at(dia, '10:30') });
  return out;
}

function slots(tipo: Tipo, dia: Date) {
  const out: { id: string; inicio: Date; fim: Date }[] = [];
  for (const j of tipo.janelas) {
    if (!j.dias.includes(dia.getDay())) continue;
    const fim = at(dia, j.fim);
    for (let t = at(dia, j.inicio); +t + tipo.duracao * 60e3 <= +fim; t = new Date(+t + tipo.passo * 60e3)) {
      out.push({ id: hhmm(t), inicio: t, fim: new Date(+t + tipo.duracao * 60e3) });
    }
  }
  return out;
}

function livre(s: { inicio: Date; fim: Date }, dia: Date) {
  const ocup = [...ocupadosDoDia(dia), ...reservas];
  return !ocup.some((o) => o.inicio < +s.fim && o.fim > +s.inicio);
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function mockApi(): Plugin {
  return {
    name: 'mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/')) return next();
        await wait(350);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const limite = new Date(+hoje + DIAS_A_FRENTE * 864e5);
        const minimo = Date.now() + ANTECEDENCIA_H * 3600e3;

        if (url.pathname === '/api/agenda.php') {
          let ini = fromIso(url.searchParams.get('inicio') ?? iso(hoje));
          let fim = fromIso(url.searchParams.get('fim') ?? iso(limite));
          if (ini < hoje) ini = hoje;
          if (fim > limite) fim = limite;
          const dias: Record<string, Record<string, unknown[]>> = {};
          for (let d = new Date(ini); d <= fim; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
            const porTipo: Record<string, unknown[]> = {};
            for (const t of TIPOS) {
              porTipo[t.id] = slots(t, d)
                .filter((s) => +s.inicio >= minimo)
                .map((s) => ({ id: s.id, rotulo: s.id, inicio: hhmm(s.inicio), fim: hhmm(s.fim), livre: livre(s, d) }));
            }
            dias[iso(d)] = porTipo;
          }
          return json(res, 200, {
            ok: true,
            demo: true,
            timezone: 'America/Sao_Paulo',
            atualizadoEm: new Date().toISOString(),
            hoje: iso(hoje),
            limite: iso(limite),
            tipos: TIPOS.map(({ id, rotulo, descricao, duracao }) => ({ id, rotulo, descricao, duracao })),
            dias,
          });
        }

        if (url.pathname === '/api/agendar.php' && req.method === 'POST') {
          const b = await body(req);
          const tipo = TIPOS.find((t) => t.id === b.tipo);
          if (!tipo) return json(res, 422, { ok: false, codigo: 'validacao', erro: 'Tipo de reunião inválido.' });
          const dia = fromIso(String(b.data ?? ''));
          const slot = slots(tipo, dia).find((s) => s.id === b.slot);
          if (!slot) return json(res, 422, { ok: false, codigo: 'validacao', erro: 'Horário inválido.' });
          if (String(b.nome ?? '').trim().length < 2)
            return json(res, 422, { ok: false, codigo: 'validacao', erro: 'Informe seu nome.' });
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(b.email ?? '')))
            return json(res, 422, { ok: false, codigo: 'validacao', erro: 'Informe um e-mail válido.' });
          if (!livre(slot, dia))
            return json(res, 409, { ok: false, codigo: 'ocupado', erro: 'Esse horário acabou de ser reservado. Escolha outro.' });
          reservas.push({ inicio: +slot.inicio, fim: +slot.fim });
          console.log('\n[demo] novo agendamento:', b);
          return json(res, 200, {
            ok: true,
            agendamento: {
              tipo: tipo.id,
              tipoRotulo: tipo.rotulo,
              data: iso(dia),
              slot: slot.id,
              inicio: hhmm(slot.inicio),
              fim: hhmm(slot.fim),
              formato: String(b.formato ?? 'online'),
              linkReuniao: '',
            },
          });
        }

        if (url.pathname === '/api/contato.php' && req.method === 'POST') {
          const b = await body(req);
          if (String(b.nome ?? '').trim().length < 2)
            return json(res, 422, { ok: false, codigo: 'validacao', erro: 'Informe seu nome.' });
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(b.email ?? '')))
            return json(res, 422, { ok: false, codigo: 'validacao', erro: 'Informe um e-mail válido.' });
          if (String(b.mensagem ?? '').trim().length < 10)
            return json(res, 422, { ok: false, codigo: 'validacao', erro: 'Escreva uma mensagem um pouco maior.' });
          console.log('\n[demo] nova mensagem de contato:', b);
          return json(res, 200, { ok: true, mensagem: 'Mensagem enviada! Respondo o quanto antes.' });
        }

        return json(res, 404, { ok: false, codigo: 'nao_encontrado', erro: 'Não encontrado.' });
      });
    },
  };
}
