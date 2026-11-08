import { Link } from 'react-router-dom';
import { LogoMark } from './Logo';

/** Selo redondo com texto girando — leva para a agenda. */
export function RotatingBadge({ texto = 'Agende uma reunião • Agende uma reunião • ', to = '/agendar' }: { texto?: string; to?: string }) {
  return (
    <Link to={to} className="badge" aria-label="Agendar uma reunião">
      <svg viewBox="0 0 200 200" className="badge__ring" aria-hidden="true">
        <defs>
          <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text>
          <textPath href="#badge-circle" textLength="488">
            {texto.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <span className="badge__core">
        <LogoMark size={44} cor="var(--ink)" seta="var(--ink)" />
      </span>
    </Link>
  );
}
