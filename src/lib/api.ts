import { site } from '../config';
import type { ContatoPedido } from '../types';

export class ApiError extends Error {
  constructor(
    message: string,
    public codigo: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${site.apiBase}/${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError('Sem conexão com o servidor. Verifique sua internet.', 'rede', 0);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    throw new ApiError('O servidor respondeu de um jeito inesperado. Tente de novo em instantes.', 'servidor', res.status);
  }

  const obj = data as { ok?: boolean; erro?: string; codigo?: string };
  if (!res.ok || !obj || obj.ok !== true) {
    throw new ApiError(obj?.erro ?? 'Algo deu errado. Tente de novo.', obj?.codigo ?? 'servidor', res.status);
  }
  return data as T;
}

export function enviarContato(pedido: ContatoPedido): Promise<{ ok: true; mensagem: string }> {
  if (site.estatico) return enviarContatoEstatico(pedido);
  return request('contato.php', { method: 'POST', body: JSON.stringify(pedido) });
}

/** Sem PHP (GitHub Pages): envia pelo FormSubmit, que encaminha para o e-mail do site. */
async function enviarContatoEstatico(p: ContatoPedido): Promise<{ ok: true; mensagem: string }> {
  const ok = { ok: true as const, mensagem: 'Recebi sua mensagem e respondo o quanto antes. Obrigado pelo contato!' };
  if (p.website) return ok; // robô
  let res: Response;
  try {
    res = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `[Portfólio] ${p.assunto} — ${p.nome}${p.empresa ? ' · ' + p.empresa : ''}`,
        _template: 'table',
        _captcha: 'false',
        _replyto: p.email,
        Nome: p.nome,
        'E-mail': p.email,
        Empresa: p.empresa || '-',
        Telefone: p.telefone || '-',
        Assunto: p.assunto,
        Mensagem: p.mensagem,
      }),
    });
  } catch {
    throw new ApiError('Sem conexão. Verifique sua internet ou me chame no WhatsApp.', 'rede', 0);
  }
  const data = (await res.json().catch(() => null)) as { success?: string | boolean } | null;
  if (!res.ok || !data || String(data.success) !== 'true') {
    throw new ApiError('Não consegui enviar agora. Tente de novo mais tarde ou me chame no WhatsApp.', 'email', res.status);
  }
  return ok;
}
