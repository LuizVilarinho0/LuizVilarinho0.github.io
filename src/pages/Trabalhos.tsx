import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Page } from '../components/Page';
import { ProjectCard } from '../components/ProjectCard';
import { Line, Reveal } from '../components/Reveal';
import { areaRotulo, projetos } from '../data/projetos';
import type { Area } from '../types';

type Filtro = 'tudo' | Area;
const ease = [0.16, 1, 0.3, 1] as const;

export default function Trabalhos() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('area');
  const filtro: Filtro = raw === 'ecommerce' || raw === 'tech' ? raw : 'tudo';
  const lista = projetos.filter((p) => filtro === 'tudo' || p.area === filtro);
  const contagem = (f: Filtro) => projetos.filter((p) => f === 'tudo' || p.area === f).length;

  const escolher = (f: Filtro) => {
    const next = new URLSearchParams(params);
    if (f === 'tudo') next.delete('area');
    else next.set('area', f);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  return (
    <Page title="Trabalhos — Luiz Vilarinho" className="pg-works">
      <section className="pg-hero wrap">
        <span className="eyebrow">( {projetos.length} trabalhos )</span>
        <h1 className="h-xxl">
          <Line>Trabalhos</Line>
          <Line delay={0.08}>
            & <em>cases</em>
          </Line>
        </h1>
        <Reveal className="pg-hero__intro" delay={0.2}>
          <p>
            De um lado, operações de e-commerce reais: marketplaces, tráfego pago e a minha própria loja. Do outro, sites, ferramentas e
            automações que eu programei.
          </p>
        </Reveal>
      </section>

      <section className="works wrap" aria-label="Lista de trabalhos">
          <div className="filters filters--left" role="tablist" aria-label="Filtrar trabalhos">
            {(['tudo', 'ecommerce', 'tech'] as Filtro[]).map((f) => (
              <button key={f} role="tab" aria-selected={filtro === f} className={`filters__btn${filtro === f ? ' is-on' : ''}`} onClick={() => escolher(f)}>
                <span>{f === 'tudo' ? 'Tudo' : areaRotulo[f]}</span>
                <sup>{contagem(f)}</sup>
              </button>
            ))}
          </div>

        {/* sem animação de saída: ela travava a troca de página depois de usar o filtro */}
        <div className="works__grid">
          {lista.map((p, i) => (
            <motion.div
              key={`${filtro}-${p.slug}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.06, ease }}
            >
              <ProjectCard p={p} index={i} />
            </motion.div>
          ))}
        </div>
      </section>

    </Page>
  );
}
