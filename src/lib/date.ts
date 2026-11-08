// Datas tratadas como texto "YYYY-MM-DD" para não sofrer com fuso horário.

const pad = (n: number) => String(n).padStart(2, '0');

export const toISO = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromISO = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const addMonths = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const addDays = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Grade do mês começando no domingo, sempre com semanas completas. */
export function monthGrid(month: Date): { date: Date; iso: string; inMonth: boolean }[] {
  const first = startOfMonth(month);
  const start = addDays(first, -first.getDay());
  const last = endOfMonth(month);
  const end = addDays(last, 6 - last.getDay());
  const out: { date: Date; iso: string; inMonth: boolean }[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    out.push({ date: d, iso: toISO(d), inMonth: d.getMonth() === month.getMonth() });
  }
  return out;
}

const fmtMes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const fmtLongo = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtCurto = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

export const nomeMes = (d: Date) => fmtMes.format(d);
export const dataLonga = (iso: string) => fmtLongo.format(fromISO(iso));
export const dataCurta = (iso: string) => fmtCurto.format(fromISO(iso)).replace(/\./g, '');
export const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
