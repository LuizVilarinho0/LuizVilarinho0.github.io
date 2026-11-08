import { Link } from 'react-router-dom';
import { IconArrowRight } from '../components/Icons';
import { LogoMark } from '../components/Logo';
import { Page } from '../components/Page';
import { RollText } from '../components/RollText';

export default function NotFound() {
  return (
    <Page title="Página não encontrada — Luiz Vilarinho" className="pg-404">
      <section className="nf wrap">
        <LogoMark size={96} />
        <h1 className="h-xxl">
          4<em>0</em>4
        </h1>
        <p className="lead">Essa página saiu do catálogo. Mas ainda tem muita coisa boa em estoque.</p>
        <Link to="/" className="btn btn--orange btn--lg roll-host">
          <RollText>Voltar ao início</RollText>
          <IconArrowRight width={18} height={18} />
        </Link>
      </section>
    </Page>
  );
}
