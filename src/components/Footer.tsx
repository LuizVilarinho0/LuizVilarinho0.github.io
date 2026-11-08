import { Link } from 'react-router-dom';
import { site, whatsappLink } from '../config';
import { LINKS, SmartLink } from './Header';
import { IconArrowUpRight, IconDownload } from './Icons';
import { LogoMark } from './Logo';
import { RollText } from './RollText';
import { redes } from './SocialLinks';

export function Footer() {
  return (
    <footer className="ftr">
      <Link to="/contato" className="ftr__big">
        <span className="ftr__big-track" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>
              Vamos conversar <LogoMark size={64} cor="currentColor" seta="var(--orange)" />
            </span>
          ))}
        </span>
        <span className="sr-only">Vamos conversar — ir para a página de contato</span>
      </Link>

      <div className="ftr__grid wrap">
        <div className="ftr__col ftr__about">
          <LogoMark size={48} />
          <p>
            Analista de e-commerce e estudante de Ciência da Computação. Eu uno a operação de loja online com dados e código.
          </p>
          <a className="btn btn--sm btn--outline roll-host" href={site.curriculo} download>
            <RollText>Baixar currículo</RollText>
            <IconDownload width={16} height={16} />
          </a>
        </div>

        <nav className="ftr__col" aria-label="Rodapé">
          <h2 className="eyebrow">Navegação</h2>
          <ul>
            {[{ to: '/', label: 'Início' }, ...LINKS].map((l) => (
              <li key={l.to}>
                <SmartLink to={l.to} className="roll-host">
                  <RollText>{l.label}</RollText>
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ftr__col">
          <h2 className="eyebrow">Contato</h2>
          <ul>
            <li>
              <a href={`mailto:${site.email}`} className="roll-host">
                <RollText>{site.email}</RollText>
              </a>
            </li>
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="roll-host">
                <RollText>{site.whatsappExibicao}</RollText>
              </a>
            </li>
            <li className="muted">{site.cidade}</li>
          </ul>
        </div>

        <div className="ftr__col">
          <h2 className="eyebrow">Redes</h2>
          <ul>
            {redes.map((r) => (
              <li key={r.id}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="ftr__social roll-host">
                  <RollText>{r.rotulo}</RollText>
                  <IconArrowUpRight width={14} height={14} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ftr__bottom wrap">
        <span>© {new Date().getFullYear()} Luiz Vilarinho</span>
        <span className="muted">Feito com React, TypeScript e PHP</span>
        <button className="ftr__top roll-host" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <RollText>Voltar ao topo ↑</RollText>
        </button>
      </div>
    </footer>
  );
}
