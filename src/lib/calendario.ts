import { site } from '../config';
import type { AgendamentoConfirmado } from '../types';

/* Gera o link "adicionar ao Google Agenda" e o arquivo .ics do agendamento,
   para quem marcou a reunião salvar na própria agenda. */

const formatoRotulo = { online: 'Online (Google Meet)', ligacao: 'Ligação', presencial: 'Presencial · Ribeirão Preto' } as const;
export const rotuloFormato = (f: keyof typeof formatoRotulo) => formatoRotulo[f];

/** "2026-11-12" + "18:30" (horário de Brasília) → "20261112T213000Z" */
function utc(data: string, hora: string): string {
  const [y, m, d] = data.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  // Brasília = UTC-3 (sem horário de verão desde 2019)
  const t = new Date(Date.UTC(y, m - 1, d, hh + 3, mm));
  return t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function fimUtc(a: AgendamentoConfirmado): string {
  // reunião que cruza a meia-noite não acontece aqui, mas por garantia:
  const data = a.fim < a.inicio ? proximoDia(a.data) : a.data;
  return utc(data, a.fim);
}

function proximoDia(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

function textos(a: AgendamentoConfirmado) {
  const titulo = `${a.tipoRotulo} com ${site.nome}`;
  const detalhes = [
    `Formato: ${rotuloFormato(a.formato)}`,
    a.linkReuniao ? `Link: ${a.linkReuniao}` : '',
    `Contato: ${site.email} · ${site.whatsappExibicao}`,
  ]
    .filter(Boolean)
    .join('\n');
  const local = a.formato === 'online' ? a.linkReuniao || 'Online' : a.formato === 'presencial' ? 'Ribeirão Preto · SP' : 'Ligação';
  return { titulo, detalhes, local };
}

export function linkGoogleAgenda(a: AgendamentoConfirmado): string {
  const { titulo, detalhes, local } = textos(a);
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    dates: `${utc(a.data, a.inicio)}/${fimUtc(a)}`,
    details: detalhes,
    location: local,
    ctz: 'America/Sao_Paulo',
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function baixarIcs(a: AgendamentoConfirmado): void {
  const { titulo, detalhes, local } = textos(a);
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Luiz Vilarinho//Portfolio//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${a.data}-${a.slot.replace(':', '')}-${Date.now()}@luizvilarinho`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${utc(a.data, a.inicio)}`,
    `DTEND:${fimUtc(a)}`,
    `SUMMARY:${esc(titulo)}`,
    `DESCRIPTION:${esc(detalhes)}`,
    `LOCATION:${esc(local)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(titulo)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `reuniao-luiz-vilarinho-${a.data}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
