import { useCallback, useEffect, useRef, useState } from 'react';
import { site } from '../config';
import { buscarAgenda } from '../lib/api';
import type { AgendaResposta } from '../types';

/*
 * Busca a agenda de um intervalo de datas e mantém tudo atualizado sozinho:
 *  - a cada `site.agendaAtualizaMs` enquanto a aba está visível;
 *  - imediatamente quando a pessoa volta para a aba;
 *  - quando `refresh()` é chamado (ex.: logo após uma reserva).
 */
export function useAgenda(inicio: string, fim: string) {
  const [data, setData] = useState<AgendaResposta | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState<number | null>(null);
  const ctrlRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    try {
      const r = await buscarAgenda(inicio, fim, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setData(r);
      setErro(null);
      setAtualizadoEm(Date.now());
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setErro((e as Error).message);
    } finally {
      if (!ctrl.signal.aborted) setCarregando(false);
    }
  }, [inicio, fim]);

  useEffect(() => {
    setCarregando(true);
    void refresh();
    const tick = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const id = window.setInterval(tick, site.agendaAtualizaMs);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
      ctrlRef.current?.abort();
    };
  }, [refresh]);

  return { data, erro, carregando, atualizadoEm, refresh };
}
