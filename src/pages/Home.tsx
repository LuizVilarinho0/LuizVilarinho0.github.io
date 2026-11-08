import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useIntroDone } from '../components/Loader';
import { IconArrowRight, IconArrowUpRight, IconDownload, IconSpark, IconWhatsapp } from '../components/Icons';
import { Marquee } from '../components/Marquee';
import { Page } from '../components/Page';
import { ProjectCard } from '../components/ProjectCard';
import { Line, Reveal } from '../components/Reveal';
import { RollText } from '../components/RollText';
import { RotatingBadge } from '../components/RotatingBadge';
import { HeroVisual } from '../components/HeroVisual';
import { site, whatsappLink } from '../config';
import { certificacoes, competencias, experiencias, idiomas } from '../data/perfil';
import { areaRotulo, projetos } from '../data/projetos';
import type { Area } from '../types';

const ease = [0.16, 1, 0.3, 1] as const;

/** Linha do título principal: só anima quando a abertura termina. */
function HeroLine({ children, i }: { children: ReactNode; i: number }) {
  const pronto = useIntroDone();
  return (
    <span className="line-mask">
      <motion.span
        className="line-mask__in"
        initial={{ y: '110%' }}
        animate={pronto ? { y: '0%' } : { y: '110%' }}
        transition={{ duration: 1.1, delay: 0.08 + i * 0.09, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function FadeIn({ children, d = 0, className }: { children: ReactNode; d?: number; className?: string }) {
  const pronto = useIntroDone();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={pronto ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, delay: d, ease }}
    >
      {children}
    </motion.div>
  );
}

const VERBOS = ['analisando dados', 'otimizando anúncios', 'codando em React', 'precificando', 'estudando SQL'];

function Agora() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % VERBOS.length), 2200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="agora">
      <span className="agora__lbl">agora:</span>
      <span className="agora__win" aria-live="off">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={i}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            {VERBOS[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

function Hero() {
  return (
    <section className="hero wrap" aria-labelledby="hero-titulo">
      <FadeIn className="hero__top">
        <span className="eyebrow">E-commerce · Marketplaces · Tecnologia</span>
        {site.disponivel && (
          <Link to="/agendar" className="status">
            <i aria-hidden="true" /> Disponível para reuniões
          </Link>
        )}
        <Agora />
      </FadeIn>

      <div className="hero__grid">
        <div className="hero__head">
        <h1 id="hero-titulo" className="hero__title">
          <HeroLine i={0}>Transformo</HeroLine>
          <HeroLine i={1}>
            <em>dados</em> em <span className="hl hl--o">vendas</span>
          </HeroLine>
          <HeroLine i={2}>
            & <em>ideias</em> em
          </HeroLine>
          <HeroLine i={3}>
            <span className="hl hl--a">código.</span>
          </HeroLine>
        </h1>
        </div>

        <FadeIn className="hero__photo" d={0.35}>
          <div className="hero__card">
            <HeroVisual />
          </div>
          <RotatingBadge />
        </FadeIn>
      </div>

      <div className="hero__bottom">
        <FadeIn className="hero__bio" d={0.5}>
          <IconSpark width={22} height={22} className="hero__spark" />
          <p>
            Analista de e-commerce com <strong>3+ anos</strong> em marketplaces, catálogo, precificação e tráfego pago, e dono da minha
            própria loja. Estudo <strong>Ciência da Computação</strong> e desenvolvo com React, TypeScript, Python e SQL.
          </p>
        </FadeIn>
        <FadeIn className="hero__ctas" d={0.6}>
          <Link to="/agendar" className="btn btn--orange roll-host">
            <RollText>Agendar reunião</RollText>
            <IconArrowUpRight width={18} height={18} />
          </Link>
          <a href={site.curriculo} download className="btn btn--outline roll-host">
            <RollText>Baixar currículo</RollText>
            <IconDownload width={18} height={18} />
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

function Faixas() {
  return (
    <section className="faixas" aria-label="Áreas de atuação">
      <Marquee items={['Marketplaces', 'Precificação', 'Meta Ads', 'Catálogo', 'Google Ads', 'Estoque', 'Pós-venda', 'Indicadores']} variant="orange" tilt={-5} speed={44} />
      <Marquee items={['React', 'TypeScript', 'SQL', 'Python', 'PHP', 'Business Intelligence', 'Automação', 'MySQL']} variant="aqua" tilt={4} speed={40} reverse />
    </section>
  );
}

const FRENTES = [
  {
    area: 'ecommerce' as Area,
    num: '01',
    titulo: 'E-commerce',
    texto: 'Do cadastro do anúncio ao pós-venda. Faço operação de marketplace com visão de dono, porque eu tenho a minha loja.',
    itens: ['Marketplaces, catálogo e anúncios', 'Precificação, margem e fluxo de caixa', 'Tráfego pago: Meta Ads e Google Ads', 'Estoque, logística e atendimento'],
  },
  {
    area: 'tech' as Area,
    num: '02',
    titulo: 'Tecnologia',
    texto: 'Código para resolver problema de negócio: sites, ferramentas, automações e dados que viram decisão.',
    itens: ['Front-end com React e TypeScript', 'Back-end e integrações com PHP', 'Dados: SQL, MySQL e BI', 'Automação de processos com Python'],
  },
];

function Frentes() {
  return (
    <section className="frentes wrap" aria-labelledby="frentes-titulo">
      <header className="sec-head">
        <span className="eyebrow">( o que eu faço )</span>
        <h2 id="frentes-titulo" className="h-xl">
          <Line>Um perfil,</Line>
          <Line delay={0.08}>
            <em>duas</em> frentes.
          </Line>
        </h2>
      </header>
      <div className="frentes__grid">
        {FRENTES.map((f, i) => (
          <Reveal key={f.area} delay={i * 0.12} className={`frente frente--${f.area}`}>
            <div className="frente__top">
              <span className="frente__num">{f.num}</span>
              <span className="frente__dot" aria-hidden="true" />
            </div>
            <h3>{f.titulo}</h3>
            <p>{f.texto}</p>
            <ul>
              {f.itens.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <Link to={`/trabalhos?area=${f.area}`} className="frente__link roll-host">
              <RollText>{`Ver trabalhos de ${f.titulo.toLowerCase()}`}</RollText>
              <IconArrowRight width={18} height={18} />
            </Link>
          </Reveal>
        ))}
        <span className="frentes__x" aria-hidden="true">
          ×
        </span>
      </div>
    </section>
  );
}

type Filtro = 'tudo' | Area;

function Trabalhos() {
  const [filtro, setFiltro] = useState<Filtro>('tudo');
  const lista = projetos.filter((p) => p.destaque && (filtro === 'tudo' || p.area === filtro));
  const contagem = (f: Filtro) => projetos.filter((p) => p.destaque && (f === 'tudo' || p.area === f)).length;
  return (
    <section className="works wrap" id="trabalhos" aria-labelledby="works-titulo">
      <header className="sec-head sec-head--row">
        <div>
          <span className="eyebrow">( trabalhos )</span>
          <h2 id="works-titulo" className="h-xl">
            <Line>Trabalhos</Line>
            <Line delay={0.08}>
              <em>selecionados</em>
            </Line>
          </h2>
        </div>
        <LayoutGroup id="filtro-home">
          <div className="filters" role="tablist" aria-label="Filtrar trabalhos">
            {(['tudo', 'ecommerce', 'tech'] as Filtro[]).map((f) => (
              <button key={f} role="tab" aria-selected={filtro === f} className={`filters__btn${filtro === f ? ' is-on' : ''}`} onClick={() => setFiltro(f)}>
                {filtro === f && <motion.span layoutId="filtro-pill" className="filters__pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span>{f === 'tudo' ? 'Tudo' : areaRotulo[f]}</span>
                <sup>{contagem(f)}</sup>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </header>

      <motion.div layout className="works__grid">
        <AnimatePresence mode="popLayout">
          {lista.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease }}
            >
              <ProjectCard p={p} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="works__more">
        <Link to="/trabalhos" className="btn btn--paper btn--lg roll-host">
          <RollText>Ver todos os trabalhos</RollText>
          <IconArrowRight width={18} height={18} />
        </Link>
      </div>
    </section>
  );
}

function Sobre() {
  const stats = [
    { n: '3+', t: 'anos em e-commerce' },
    { n: '4', t: 'experiências profissionais' },
    { n: '1', t: 'loja própria' },
    { n: '3', t: 'marketplaces operados' },
  ];
  return (
    <section className="sobre" id="sobre" aria-labelledby="sobre-titulo">
      <div className="wrap">
        <header className="sec-head">
          <span className="eyebrow">( sobre mim )</span>
          <h2 id="sobre-titulo" className="h-xl">
            <Line>Muito prazer,</Line>
            <Line delay={0.08}>
              eu sou o <em>Luiz.</em>
            </Line>
          </h2>
        </header>

        <div className="sobre__grid">
          <Reveal className="sobre__txt">
            <p className="lead">
              Comecei no e-commerce em 2023, cadastrando anúncios e conferindo estoque. Hoje cuido de catálogo, preço e indicadores numa
              operação em tempo integral, e toco a minha própria loja.
            </p>
            <p>
              Na faculdade de Ciência da Computação descobri a peça que faltava: código. Com SQL, BI e automação, eu tiro a operação do
              "achismo" e decido com dados. Com React, TypeScript e PHP, construo as ferramentas e os sites que o negócio precisa.
            </p>
            <p>Sou de Ribeirão Preto, aprendo rápido e gosto de entender o processo inteiro, do clique no anúncio até a nota fiscal.</p>
          </Reveal>

          <Reveal className="sobre__facts" delay={0.1}>
            <dl>
              <div>
                <dt>Base</dt>
                <dd>{site.cidade}</dd>
              </div>
              <div>
                <dt>Formação</dt>
                <dd>Ciência da Computação · UNIP (previsão: dez/2027)</dd>
              </div>
              <div>
                <dt>Idiomas</dt>
                <dd>{idiomas}</dd>
              </div>
              <div>
                <dt>Foco</dt>
                <dd>Marketplaces, tráfego pago, dados e desenvolvimento web</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <ul className="stats">
          {stats.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.07}>
              <strong>{s.n}</strong>
              <span>{s.t}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Experiencia() {
  return (
    <section className="exp wrap" id="experiencia" aria-labelledby="exp-titulo">
      <header className="sec-head sec-head--row">
        <div>
          <span className="eyebrow">( trajetória )</span>
          <h2 id="exp-titulo" className="h-xl">
            <Line>Experiência</Line>
          </h2>
        </div>
        <a href={site.curriculo} download className="btn btn--outline roll-host">
          <RollText>Currículo em PDF</RollText>
          <IconDownload width={18} height={18} />
        </a>
      </header>

      <ol className="exp__list">
        {experiencias.map((e, i) => {
          const conteudo = (
            <>
              <span className="exp__per">{e.periodo}</span>
              <span className="exp__cargo">{e.cargo}</span>
              <span className="exp__emp">{e.empresa}</span>
              <span className="exp__det">{e.detalhe}</span>
              <span className="exp__go" aria-hidden="true">
                {e.slug ? <IconArrowUpRight width={20} height={20} /> : null}
              </span>
            </>
          );
          return (
            <Reveal as="li" key={e.cargo + e.empresa} delay={i * 0.05} className={`exp__row exp__row--${e.area}`}>
              {e.slug ? (
                <Link to={`/trabalhos/${e.slug}`} className="exp__in">
                  {conteudo}
                </Link>
              ) : (
                <div className="exp__in">{conteudo}</div>
              )}
            </Reveal>
          );
        })}
      </ol>

      <div className="exp__extra">
        <Reveal className="exp__certs">
          <h3 className="eyebrow">Certificações</h3>
          <ul>
            {certificacoes.map((c) => (
              <li key={c}>
                <IconSpark width={12} height={12} /> {c}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="exp__skills" delay={0.1}>
          <h3 className="eyebrow">Competências</h3>
          <div className="skills">
            {competencias.map((g) => (
              <div key={g.grupo} className={`skills__grp skills__grp--${g.area}`}>
                <h4>{g.grupo}</h4>
                <ul>
                  {g.itens.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Chamada() {
  return (
    <section className="cta wrap" aria-labelledby="cta-titulo">
      <h2 id="cta-titulo" className="cta__title">
        <Line>Bora construir</Line>
        <Line delay={0.08}>
          algo que <em>vende</em>
        </Line>
        <Line delay={0.16}>
          <span className="cta__paren">(e que roda liso)</span>
        </Line>
      </h2>
      <Reveal className="cta__actions" delay={0.2}>
        <Link to="/agendar" className="btn btn--orange btn--lg swap-host">
          <span className="swap">
            <span>Agendar reunião</span>
            <span aria-hidden="true">Escolher um horário →</span>
          </span>
        </Link>
        <Link to="/contato" className="btn btn--outline btn--lg roll-host">
          <RollText>Mandar mensagem</RollText>
        </Link>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--lg roll-host">
          <IconWhatsapp width={20} height={20} />
          <RollText>WhatsApp</RollText>
        </a>
      </Reveal>
    </section>
  );
}

export default function Home() {
  return (
    <Page title="Luiz Vilarinho — E-commerce & Tecnologia" className="home">
      <Hero />
      <Faixas />
      <Frentes />
      <Trabalhos />
      <Sobre />
      <Experiencia />
      <Chamada />
    </Page>
  );
}
