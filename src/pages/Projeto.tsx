import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CoverArt } from '../components/CoverArt';
import { IconArrowLeft, IconArrowRight, IconArrowUpRight, IconGithub, IconSpark } from '../components/Icons';
import { Page } from '../components/Page';
import { Line, Reveal } from '../components/Reveal';
import { RollText } from '../components/RollText';
import { areaRotulo, projetos } from '../data/projetos';
import NotFound from './NotFound';

export default function Projeto() {
  const { slug } = useParams();
  const idx = projetos.findIndex((p) => p.slug === slug);
  if (idx < 0) return <NotFound />;
  const p = projetos[idx];
  const prox = projetos[(idx + 1) % projetos.length];

  return (
    <Page title={`${p.titulo} — Luiz Vilarinho`} className={`pg-proj pg-proj--${p.area}`}>
      <section className="proj-hero wrap">
        <Link to={`/trabalhos?area=${p.area}`} className="back roll-host">
          <IconArrowLeft width={18} height={18} />
          <RollText>Todos os trabalhos</RollText>
        </Link>
        <div className="proj-hero__chips">
          <span className={`chip chip--${p.area}`}>{areaRotulo[p.area]}</span>
          <span className="chip chip--ghost">{p.periodo}</span>
        </div>
        <h1 className="h-xxl">
          <Line>{p.titulo}</Line>
        </h1>
        <Reveal as="p" className="proj-hero__chamada" delay={0.15}>
          {p.chamada}
        </Reveal>

        <Reveal delay={0.2}>
          <dl className="proj-meta">
          <div>
            <dt>Papel</dt>
            <dd>{p.papel}</dd>
          </div>
          <div>
            <dt>Período</dt>
            <dd>{p.periodo}</dd>
          </div>
          <div>
            <dt>Frentes</dt>
            <dd>{p.tags.join(' • ')}</dd>
          </div>
          {p.links && (
            <div className="proj-meta__links">
              <dt>Links</dt>
              <dd>
                {p.links.site && (
                  <a href={p.links.site} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--orange roll-host">
                    <RollText>Ver online</RollText>
                    <IconArrowUpRight width={16} height={16} />
                  </a>
                )}
                {p.links.github && (
                  <a href={p.links.github} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--outline roll-host">
                    <IconGithub width={16} height={16} />
                    <RollText>Código</RollText>
                  </a>
                )}
              </dd>
            </div>
          )}
          </dl>
        </Reveal>
      </section>

      <Reveal className="proj-cover wrap" y={60}>
        <div className="proj-cover__in" style={{ '--cover': p.cor } as CSSProperties}>
          <CoverArt capa={p.capa} eager />
        </div>
      </Reveal>

      <section className="proj-body wrap">
        <Reveal className="proj-block">
          <h2 className="eyebrow">( contexto )</h2>
          <p className="lead">{p.contexto}</p>
        </Reveal>

        <Reveal className="proj-block">
          <h2 className="eyebrow">( o que eu fiz )</h2>
          <ol className="proj-feitos">
            {p.feitos.map((f, i) => (
              <li key={f}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <p>{f}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="proj-block">
          <h2 className="eyebrow">( ferramentas e competências )</h2>
          <ul className="proj-stack">
            {p.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="proj-block proj-quote">
          <IconSpark width={28} height={28} />
          <p>{p.aprendizados}</p>
        </Reveal>
      </section>

      <Link to={`/trabalhos/${prox.slug}`} className="next wrap">
        <span className="eyebrow">Próximo trabalho</span>
        <span className="next__title">
          {prox.titulo}
          <IconArrowRight width={56} height={56} />
        </span>
        <span className="next__sub">
          {areaRotulo[prox.area]} · {prox.chamada}
        </span>
      </Link>
    </Page>
  );
}
