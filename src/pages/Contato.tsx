import { useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconArrowUpRight, IconCheck, IconDownload, IconMail } from '../components/Icons';
import { Page } from '../components/Page';
import { Line, Reveal } from '../components/Reveal';
import { RollText } from '../components/RollText';
import { redes } from '../components/SocialLinks';
import { site } from '../config';
import { ApiError, enviarContato } from '../lib/api';

const ASSUNTOS = ['Vaga de e-commerce', 'Vaga de tecnologia', 'Freela / projeto', 'Outro assunto'];

export default function Contato() {
  const inicio = useRef(Date.now());
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [telefone, setTelefone] = useState('');
  const [assunto, setAssunto] = useState(ASSUNTOS[0]);
  const [mensagem, setMensagem] = useState('');
  const [website, setWebsite] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (nome.trim().length < 2) return setErro('Informe seu nome.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setErro('Informe um e-mail válido para eu te responder.');
    if (mensagem.trim().length < 10) return setErro('Escreva uma mensagem um pouco maior (mínimo de 10 caracteres).');
    setEnviando(true);
    try {
      const r = await enviarContato({
        nome: nome.trim(),
        email: email.trim(),
        empresa: empresa.trim(),
        telefone: telefone.trim(),
        assunto,
        mensagem: mensagem.trim(),
        website,
        t: Date.now() - inicio.current,
      });
      setOk(r.mensagem);
    } catch (err) {
      setErro((err as ApiError).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Page title="Contato — Luiz Vilarinho" className="pg-contato">
      <section className="pg-hero wrap">
        <span className="eyebrow">( contato )</span>
        <h1 className="h-xxl">
          <Line>Fala</Line>
          <Line delay={0.08}>
            <em>comigo.</em>
          </Line>
        </h1>
      </section>

      <section className="contato wrap">
        <Reveal className="contato__side">
          <p className="lead">
            Tem uma vaga, um projeto ou uma ideia? Mande uma mensagem pelo formulário: ela chega direto no meu e-mail e eu respondo o quanto antes.
          </p>

          <a href={`mailto:${site.email}`} className="canal canal--mail">
            <IconMail width={22} height={22} />
            <span>
              <small>E-mail</small>
              {site.email}
            </span>
            <IconArrowUpRight width={18} height={18} />
          </a>

          <ul className="canais">
            {redes.map(({ id, rotulo, href, Icon }) => (
              <li key={id}>
                <a href={href} target="_blank" rel="noopener noreferrer" className={`canal canal--${id}`}>
                  <Icon width={20} height={20} />
                  <span>{rotulo}</span>
                  <IconArrowUpRight width={16} height={16} />
                </a>
              </li>
            ))}
          </ul>

          <a href={site.curriculo} download className="cta-card">
            <IconDownload width={26} height={26} />
            <span>
              <strong>Quer ver tudo em um só lugar?</strong>
              Baixe meu currículo em PDF.
            </span>
            <IconArrowUpRight width={20} height={20} />
          </a>
        </Reveal>

        <Reveal className="contato__form" delay={0.1}>
          <AnimatePresence mode="wait">
            {ok ? (
              <motion.div key="ok" className="ok" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                <span className="ok__icon">
                  <IconCheck width={30} height={30} />
                </span>
                <h2>Mensagem enviada!</h2>
                <p>{ok}</p>
                <button
                  className="link-btn"
                  onClick={() => {
                    setOk(null);
                    setMensagem('');
                    inicio.current = Date.now();
                  }}
                >
                  Enviar outra mensagem
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" className="form" onSubmit={enviar} noValidate exit={{ opacity: 0, y: -16 }}>
                <div className="hp" aria-hidden="true">
                  <label>
                    Não preencha
                    <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </label>
                </div>

                <fieldset className="field">
                  <legend>Assunto</legend>
                  <div className="pills" role="radiogroup">
                    {ASSUNTOS.map((a) => (
                      <button type="button" key={a} role="radio" aria-checked={assunto === a} className={`pill${assunto === a ? ' is-on' : ''}`} onClick={() => setAssunto(a)}>
                        {a}
                      </button>
                    ))}
                  </div>
                </fieldset>

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
                    <span>Telefone</span>
                    <input value={telefone} onChange={(e) => setTelefone(e.target.value)} autoComplete="tel" inputMode="tel" maxLength={20} />
                  </label>
                </div>
                <label className="field">
                  <span>Mensagem *</span>
                  <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={6} maxLength={3000} required placeholder="Conte um pouco sobre a vaga ou o projeto…" />
                </label>

                {erro && (
                  <p className="form-erro" role="alert">
                    {erro}
                  </p>
                )}
                <button className="btn btn--orange btn--lg btn--block roll-host" type="submit" disabled={enviando}>
                  {enviando ? 'Enviando…' : <RollText>Enviar mensagem</RollText>}
                  {!enviando && <IconArrowUpRight width={18} height={18} />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </section>
    </Page>
  );
}
