import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { areaRotulo } from '../data/projetos';
import type { Projeto } from '../types';
import { CoverArt } from './CoverArt';
import { IconArrowUpRight } from './Icons';

export function ProjectCard({ p, index }: { p: Projeto; index?: number }) {
  return (
    <Link to={`/trabalhos/${p.slug}`} className={`pcard pcard--${p.area}`}>
      <div className="pcard__cover" style={{ '--cover': p.cor } as CSSProperties}>
        <CoverArt capa={p.capa} />
        <span className={`chip chip--${p.area}`}>{areaRotulo[p.area]}</span>
        <span className="pcard__go" aria-hidden="true">
          <IconArrowUpRight width={22} height={22} />
        </span>
      </div>
      <div className="pcard__meta">
        {index !== undefined && <span className="pcard__num">{String(index + 1).padStart(2, '0')}</span>}
        <h3>{p.titulo}</h3>
        <span className="pcard__year">{p.ano}</span>
      </div>
      <p className="pcard__chamada">{p.chamada}</p>
      <p className="pcard__tags">{p.tags.join(' • ')}</p>
    </Link>
  );
}
