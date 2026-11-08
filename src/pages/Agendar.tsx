import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconClock,
  IconDownload,
  IconPhone,
  IconPin,
  IconVideo,
  IconWhatsapp,
} from '../components/Icons';
import { LogoMark } from '../components/Logo';
import { Page } from '../components/Page';
import { Line, Reveal } from '../components/Reveal';
import { site, whatsappLink } from '../config';
import { useAgenda } from '../hooks/useAgenda';
import { agendar, ApiError } from '../lib/api';
import { baixarIcs, linkGoogleAgenda, rotuloFormato } from '../lib/calendario';
import { addMonths, dataLonga, DIAS_SEMANA, endOfMonth, monthGrid, nomeMes, startOfMonth, toISO } from '../lib/date';
import type { AgendaSlot, AgendaTipo, AgendamentoConfirmado, Formato } from '../types';

// ------------------------------------------------------------ utilidades

function mascaraTelefone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const emailValido = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim());

function useAgora(intervalo = 1000) {
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setAgora(Date.now()), intervalo);
    return () => window.clearInterval(id);
  }, [intervalo]);
  return agora;
}

function AoVivo({ atualizadoEm, erro }: { atualizadoEm: number | null; erro: string | null }) {
  const agora = useAgora();
  if (erro) return <span className="aovivo aovivo--erro">sem conexão · tentando de novo</span>;
  if (!atualizadoEm) return <span className="aovivo">conectando à agenda…</span>;
  const s = Math.max(0, Math.round((agora - atualizadoEm) / 1000));
  return (
    <span className="aovivo">
      <i className="aovivo__dot" aria-hidden="true" /> agenda ao vivo · atualizada {s < 5 ? 'agora' : `há ${s}s`}
    </span>
  );
}

const FORMATOS: { id: Formato; rotulo: string; Icon: typeof IconVideo }[] = [
  { id: 'online', rotulo: 'Online', Icon: IconVideo },
  { id: 'ligacao', rotulo: 'Ligação', Icon: IconPhone },
  { id: 'presencial', rotulo: 'Presencial', Icon: IconPin },
];

// ------------------------------------------------------------ calendário

interface CalProps {
  mes: Date;
  tipo: AgendaTipo | undefined;
  dias: Record<string, Record<string, AgendaSlot[]>> | undefined;
  hoje: string;
  selecionado: string | null;
  onSelect: (iso: string) => void;
}

function Calendario({ mes, tipo, dias, hoje, selecionado, onSelect }: CalProps) {
  const grade = useMemo(() => monthGrid(mes), [mes]);
  return (
    <div className="cal" role="grid" aria-label={`Calendário de ${nomeMes(mes)}`}>
      {DIAS_SEMANA.map((d) => (
        <span key={d} className="cal__dow" role="columnheader">
          {d}
        </span>
      ))}
      {grade.map(({ date, iso, inMonth }) => {
        const slots = tipo ? dias?.[iso]?.[tipo.id] : undefined;
        const livres = slots?.filter((s) => s.livre).length ?? 0;
        const total = slots?.length ?? 0;
        const estado = !inMonth || !slots ? 'fora' : total === 0 ? 'fechado' : livres === 0 ? 'lotado' : 'livre';
        const label = `${dataLonga(iso)}: ${
          estado === 'livre' ? `${livres} ${livres === 1 ? 'horário livre' : 'horários livres'}` : estado === 'lotado' ? 'sem horários' : 'indisponível'
        }`;
        return (
          <button
            key={iso}
            role="gridcell"
            className={`cal__day cal__day--${estado}${iso === selecionado ? ' is-selected' : ''}${iso === hoje ? ' is-today' : ''}`}
            disabled={estado !== 'livre'}
            onClick={() => onSelect(iso)}
            aria-label={label}
            aria-pressed={iso === selecionado}
            style={{ visibility: inMonth ? 'visible' : 'hidden' }}
          >
            <span className="cal__num">{date.getDate()}</span>
            {estado === 'livre' && <i className="cal__dot" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------ página

function AgendarCompleto() {
  const hojeLocal = useMemo(() => new Date(), []);
  const [mes, setMes] = useState(() => startOfMonth(hojeLocal));
  const { data, erro, carregando, atualizadoEm, refresh } = useAgenda(toISO(startOfMonth(mes)), toISO(endOfMonth(mes)));

  const [tipoId, setTipoId] = useState<string | null>(null);
  const [dia, setDia] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<'horario' | 'dados'>('horario');
  const [aviso, setAviso] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [telefone, setTelefone] = useState('');
  const [formato, setFormato] = useState<Formato>('online');
  const [pauta, setPauta] = useState('');
  const [website, setWebsite] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<AgendamentoConfirmado | null>(null);

  const tipos = data?.tipos ?? [];
  const tipo = tipos.find((t) => t.id === tipoId) ?? tipos[0];
  const slots = dia && tipo ? data?.dias[dia]?.[tipo.id] ?? [] : [];
  const slot = slots.find((s) => s.id === slotId);

  // Se o horário escolhido foi ocupado enquanto a pessoa preenchia, avisa.
  useEffect(() => {
    if (slotId && slot && !slot.livre && !confirmado) {
      setAviso('Ops! Esse horário acabou de ser ocupado. Escolha outro.');
      setSlotId(null);
      setEtapa('horario');
    }
  }, [slot, slotId, confirmado]);

  const mesAtual = startOfMonth(hojeLocal);
  const podeVoltar = mes > mesAtual;
  const podeAvancar = data ? startOfMonth(new Date(data.limite + 'T12:00:00')) > mes : true;

  const mudarMes = (n: number) => {
    setMes((m) => addMonths(m, n));
    setDia(null);
    setSlotId(null);
    setAviso(null);
  };

  const escolherTipo = (id: string) => {
    setTipoId(id);
    setSlotId(null);
    setAviso(null);
    setEtapa('horario');
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!tipo || !dia || !slot) return;
    setErroForm(null);
    if (nome.trim().length < 2) return setErroForm('Informe seu nome.');
    if (!emailValido(email)) return setErroForm('Informe um e-mail válido: é por ele que você recebe a confirmação.');
    if (telefone && telefone.replace(/\D/g, '').length < 10) return setErroForm('Confira o telefone (com DDD) ou deixe em branco.');

    setEnviando(true);
    try {
      const { agendamento } = await agendar({
        tipo: tipo.id,
        data: dia,
        slot: slot.id,
        nome: nome.trim(),
        email: email.trim(),
        empresa: empresa.trim(),
        telefone,
        formato,
        pauta: pauta.trim(),
        website,
      });
      setConfirmado(agendamento);
      void refresh();
      window.scrollTo({ top: (document.querySelector('.sched') as HTMLElement | null)?.offsetTop ?? 0, behavior: 'smooth' });
    } catch (err) {
      const ex = err as ApiError;
      if (ex.codigo === 'ocupado') {
        setAviso(ex.message);
        setSlotId(null);
        setEtapa('horario');
        void refresh();
      } else {
        setErroForm(ex.message);
      }
    } finally {
      setEnviando(false);
    }
  };

  const novo = () => {
    setConfirmado(null);
    setDia(null);
    setSlotId(null);
    setEtapa('horario');
    setPauta('');
  };

  const msgWhats = confirmado
    ? `Olá, Luiz! Acabei de agendar pelo seu site: ${confirmado.tipoRotulo} em ${dataLonga(confirmado.data)}, às ${confirmado.inicio}. ${
        empresa ? `Sou ${nome.trim()}, da ${empresa.trim()}.` : `Sou ${nome.trim()}.`
      }`
    : '';

  return (
    <Page title="Agendar reunião — Luiz Vilarinho" className="pg-agenda">
      <section className="pg-hero wrap">
        <span className="eyebrow">( agenda )</span>
        <h1 className="h-xxl">
          <Line>Vamos marcar</Line>
          <Line delay={0.08}>
            uma <em>conversa?</em>
          </Line>
        </h1>
        <Reveal className="pg-hero__intro pg-hero__intro--row" delay={0.2}>
          <p>
            Esta é a minha agenda real, ligada ao Google Agenda. Escolha um horário livre para uma reunião ou um bate-papo e você recebe a
            confirmação por e-mail na hora.
          </p>
          <AoVivo atualizadoEm={atualizadoEm} erro={erro} />
        </Reveal>
      </section>

      {data?.demo && (
        <div className="wrap">
          <p className="demo-banner">Modo demonstração: a agenda ainda não está ligada ao Google Agenda (veja o LEIA-ME para ativar).</p>
        </div>
      )}

      <section className="sched wrap" aria-label="Agendamento">
        {/* 1. Tipo */}
        <div className="tipos" role="radiogroup" aria-label="Tipo de conversa">
          {(tipos.length ? tipos : [null, null]).map((t, i) =>
            t ? (
              <button
                key={t.id}
                role="radio"
                aria-checked={t.id === tipo?.id}
                className={`tipo${t.id === tipo?.id ? ' is-on' : ''}`}
                onClick={() => escolherTipo(t.id)}
                disabled={!!confirmado}
              >
                <span className="tipo__top">
                  <span className="tipo__num">0{i + 1}</span>
                  <span className="tipo__dur">
                    <IconClock width={15} height={15} /> {t.duracao} min
                  </span>
                </span>
                <strong>{t.rotulo}</strong>
                <span className="tipo__desc">{t.descricao}</span>
                <span className="tipo__check" aria-hidden="true">
                  <IconCheck width={14} height={14} />
                </span>
              </button>
            ) : (
              <div key={i} className="tipo tipo--skeleton" />
            ),
          )}
        </div>

        <div className="sched__card">
          {/* coluna de resumo */}
          <aside className="sched__info">
            <div className="sched__who">
              <span className="sched__avatar" aria-hidden="true">
                <LogoMark size={30} cor="var(--ink)" seta="var(--paper)" />
              </span>
              <div>
                <span className="muted">{site.nome}</span>
                <strong>{tipo?.rotulo ?? 'Carregando…'}</strong>
              </div>
            </div>
            <ul className="sched__facts">
              <li>
                <IconClock width={18} height={18} /> {tipo ? `${tipo.duracao} minutos` : '—'}
              </li>
              <li>
                <IconVideo width={18} height={18} /> Online, ligação ou presencial
              </li>
              <li>
                <IconCalendar width={18} height={18} />
                {dia ? (
                  <span>
                    {dataLonga(dia)}
                    {slot && (
                      <>
                        <br />
                        <b>
                          {slot.inicio} – {slot.fim}
                        </b>
                      </>
                    )}
                  </span>
                ) : (
                  'Escolha um dia'
                )}
              </li>
            </ul>
            <p className="sched__tz">Horário de Brasília (GMT-3)</p>
          </aside>

          <div className="sched__main">
            <AnimatePresence mode="wait">
              {confirmado ? (
                <motion.div
                  key="ok"
                  className="ok"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="ok__icon">
                    <IconCheck width={30} height={30} />
                  </span>
                  <span className="eyebrow">Agendado!</span>
                  <h2>{dataLonga(confirmado.data)}</h2>
                  <p className="ok__slot">
                    {confirmado.tipoRotulo} · {confirmado.inicio}–{confirmado.fim} · {rotuloFormato(confirmado.formato)}
                  </p>
                  <p>
                    O horário já está na minha agenda e uma confirmação foi para <b>{email.trim()}</b>.{' '}
                    {confirmado.formato === 'online' &&
                      (confirmado.linkReuniao ? (
                        <>
                          Link da chamada:{' '}
                          <a href={confirmado.linkReuniao} target="_blank" rel="noopener noreferrer">
                            {confirmado.linkReuniao}
                          </a>
                        </>
                      ) : (
                        'Te envio o link da chamada por e-mail antes do horário.'
                      ))}
                  </p>
                  <div className="ok__actions">
                    <a className="btn btn--orange" href={linkGoogleAgenda(confirmado)} target="_blank" rel="noopener noreferrer">
                      <IconCalendar width={18} height={18} /> Salvar no Google Agenda
                    </a>
                    <button className="btn btn--outline" onClick={() => baixarIcs(confirmado)}>
                      <IconDownload width={18} height={18} /> Baixar .ics
                    </button>
                    <a className="btn btn--ghost" href={whatsappLink(msgWhats)} target="_blank" rel="noopener noreferrer">
                      <IconWhatsapp width={18} height={18} /> Avisar no WhatsApp
                    </a>
                  </div>
                  <button className="link-btn" onClick={novo}>
                    Agendar outro horário
                  </button>
                </motion.div>
              ) : etapa === 'horario' ? (
                <motion.div
                  key="horario"
                  className="sched__pick"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="sched__cal">
                    <div className="cal__head">
                      <button className="icon-btn" onClick={() => mudarMes(-1)} disabled={!podeVoltar} aria-label="Mês anterior">
                        <IconArrowLeft />
                      </button>
                      <h2 aria-live="polite">{nomeMes(mes)}</h2>
                      <button className="icon-btn" onClick={() => mudarMes(1)} disabled={!podeAvancar} aria-label="Próximo mês">
                        <IconArrowRight />
                      </button>
                    </div>
                    <div className={`cal__wrap${carregando && !data ? ' is-loading' : ''}`}>
                      <Calendario
                        mes={mes}
                        tipo={tipo}
                        dias={data?.dias}
                        hoje={data?.hoje ?? toISO(hojeLocal)}
                        selecionado={dia}
                        onSelect={(iso) => {
                          setDia(iso);
                          setSlotId(null);
                          setAviso(null);
                        }}
                      />
                    </div>
                    {erro && !data && (
                      <p className="form-erro" role="alert">
                        {erro}{' '}
                        <a href={whatsappLink('Olá, Luiz! Quero marcar uma conversa.')} target="_blank" rel="noopener noreferrer">
                          Marque pelo WhatsApp.
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="sched__slots">
                    {aviso && (
                      <p className="aviso" role="alert">
                        {aviso}
                      </p>
                    )}
                    {!dia ? (
                      <div className="vazio">
                        <IconCalendar width={28} height={28} />
                        <p>Escolha um dia com ponto laranja no calendário.</p>
                      </div>
                    ) : (
                      <>
                        <h3>{dataLonga(dia)}</h3>
                        <div className="slots" role="radiogroup" aria-label="Horários">
                          {slots.map((s) => (
                            <button
                              key={s.id}
                              role="radio"
                              aria-checked={s.id === slotId}
                              disabled={!s.livre}
                              className={`slot${s.id === slotId ? ' is-on' : ''}`}
                              onClick={() => {
                                setSlotId(s.id);
                                setAviso(null);
                              }}
                            >
                              {s.livre ? s.inicio : <s>{s.inicio}</s>}
                            </button>
                          ))}
                        </div>
                        <button className="btn btn--orange btn--block" disabled={!slot} onClick={() => setEtapa('dados')}>
                          {slot ? `Continuar com ${slot.inicio}` : 'Escolha um horário'} <IconArrowRight width={18} height={18} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="dados"
                  className="form"
                  onSubmit={enviar}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.35 }}
                  noValidate
                >
                  <button type="button" className="back" onClick={() => setEtapa('horario')}>
                    <IconArrowLeft width={18} height={18} /> Trocar horário
                  </button>
                  <h2 className="form__title">Seus dados</h2>

                  <div className="hp" aria-hidden="true">
                    <label>
                      Não preencha
                      <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </label>
                  </div>

                  <div className="form__row">
                    <label className="field">
                      <span>Nome *</span>
                      <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" maxLength={80} required />
                    </label>
                    <label className="field">
                      <span>E-mail *</span>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={120} required />
                    </label>
                  </div>
                  <div className="form__row">
                    <label className="field">
                      <span>Empresa</span>
                      <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} autoComplete="organization" maxLength={80} />
                    </label>
                    <label className="field">
                      <span>Telefone / WhatsApp</span>
                      <input
                        value={telefone}
                        onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                        inputMode="tel"
                        autoComplete="tel-national"
                        placeholder="(16) 99999-9999"
                      />
                    </label>
                  </div>

                  <fieldset className="field">
                    <legend>Formato</legend>
                    <div className="seg" role="radiogroup">
                      {FORMATOS.map(({ id, rotulo, Icon }) => (
                        <button type="button" key={id} role="radio" aria-checked={formato === id} className={`seg__btn${formato === id ? ' is-on' : ''}`} onClick={() => setFormato(id)}>
                          <Icon width={17} height={17} /> {rotulo}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <label className="field">
                    <span>Sobre o que vamos conversar?</span>
                    <textarea
                      value={pauta}
                      onChange={(e) => setPauta(e.target.value)}
                      rows={3}
                      maxLength={600}
                      placeholder="Vaga, etapa do processo seletivo, projeto…"
                    />
                  </label>

                  {erroForm && (
                    <p className="form-erro" role="alert">
                      {erroForm}
                    </p>
                  )}
                  <button className="btn btn--orange btn--lg btn--block" type="submit" disabled={enviando}>
                    {enviando ? 'Agendando…' : 'Confirmar agendamento'}
                    {!enviando && <IconCheck width={18} height={18} />}
                  </button>
                  <p className="form-nota">Seus dados são usados só para este agendamento.</p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </Page>
  );
}

/** GitHub Pages (sem PHP): não dá para ler a agenda, então convida para marcar direto. */
function AgendarEstatico() {
  const msg = 'Olá, Luiz! Vim pelo seu portfólio e gostaria de marcar uma reunião. Quais horários você tem livres?';
  return (
    <Page title="Agendar reunião — Luiz Vilarinho" className="pg-agenda">
      <section className="pg-hero wrap">
        <span className="eyebrow">( agenda )</span>
        <h1 className="h-xxl">
          <Line>Vamos marcar</Line>
          <Line delay={0.08}>
            uma <em>conversa?</em>
          </Line>
        </h1>
      </section>
      <section className="sched wrap">
        <Reveal className="sched__card sched__card--simples">
          <div className="sched__main">
            <div className="ok">
              <span className="ok__icon">
                <IconCalendar width={28} height={28} />
              </span>
              <h2>Reunião ou bate-papo</h2>
              <p>
                Me chame no WhatsApp ou mande um e-mail dizendo o melhor dia para você. Respondo rápido com os horários livres e já te mando o
                convite.
              </p>
              <div className="ok__actions">
                <a className="btn btn--orange" href={whatsappLink(msg)} target="_blank" rel="noopener noreferrer">
                  <IconWhatsapp width={18} height={18} /> Marcar pelo WhatsApp
                </a>
                <a className="btn btn--outline" href={`mailto:${site.email}?subject=${encodeURIComponent('Reunião — via portfólio')}`}>
                  <IconCalendar width={18} height={18} /> Marcar por e-mail
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </Page>
  );
}

export default function Agendar() {
  return site.estatico ? <AgendarEstatico /> : <AgendarCompleto />;
}
