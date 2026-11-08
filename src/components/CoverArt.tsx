import type { Capa } from '../types';

/* Capas ilustradas, desenhadas em código, para trabalhos sem screenshot. */

function Funil() {
  const etapas = [
    ['Anúncio', 100],
    ['Visita', 86],
    ['Carrinho', 72],
    ['Pedido', 58],
    ['Pós-venda', 46],
  ] as const;
  return (
    <div className="art art--funil">
      <span className="art__big">MLJ</span>
      <ol className="art__funil">
        {etapas.map(([rotulo, w], i) => (
          <li key={rotulo} style={{ width: `${w}%`, animationDelay: `${i * 0.08}s` }}>
            <span>{rotulo}</span>
            <i>0{i + 1}</i>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Catalogo() {
  return (
    <div className="art art--catalogo">
      <div className="art__grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`art__prod${i === 2 ? ' is-hot' : ''}`}>
            <span className="art__img" style={{ background: `hsl(${(i * 47) % 360} 18% ${78 - (i % 3) * 6}%)` }} />
            <span className="art__l1" />
            <span className="art__l2" />
            <span className="art__price">R$</span>
            {i === 2 && <span className="art__stick">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Ads() {
  return (
    <div className="art art--ads">
      <div className="art__chips">
        <span>Meta Ads</span>
        <span>Google Ads</span>
      </div>
      <svg viewBox="0 0 400 200" className="art__chart" preserveAspectRatio="none" aria-hidden="true">
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="0" x2="400" y1={y} y2={y} />
        ))}
        <path className="art__area" d="M0 170 L50 160 L100 165 L150 130 L200 138 L250 100 L300 86 L350 60 L400 40 L400 200 L0 200 Z" />
        <path className="art__line" d="M0 170 L50 160 L100 165 L150 130 L200 138 L250 100 L300 86 L350 60 L400 40" />
        {[
          [150, 130],
          [250, 100],
          [350, 60],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="5" />
        ))}
      </svg>
      <span className="art__mono">CTR · CPC · CPA · ROAS</span>
    </div>
  );
}

function Marketplaces() {
  const nos = [
    { t: 'Shopee', x: 18, y: 24 },
    { t: 'Magalu', x: 82, y: 22 },
    { t: 'B2W', x: 86, y: 76 },
    { t: 'NF-e', x: 16, y: 78 },
    { t: 'Estoque', x: 50, y: 90 },
  ];
  return (
    <div className="art art--mkt">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="art__links" aria-hidden="true">
        {nos.map((n) => (
          <line key={n.t} x1="50" y1="50" x2={n.x} y2={n.y} />
        ))}
      </svg>
      <span className="art__hub">Bling</span>
      {nos.map((n) => (
        <span key={n.t} className="art__node" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
          {n.t}
        </span>
      ))}
    </div>
  );
}

function Terminal() {
  return (
    <div className="art art--term">
      <div className="art__win">
        <div className="art__bar">
          <i />
          <i />
          <i />
          <span>organizer — zsh</span>
        </div>
        <pre>
          <span className="c-p">$</span> python -m organizer ~/Downloads --dry-run{'\n'}
          <span className="c-d">  analisando 7 arquivos…</span>
          {'\n'}
          <span className="c-a">  → Imagens/</span>     foto.png, banner.jpg{'\n'}
          <span className="c-a">  → Documentos/</span>  contrato.pdf, nota.pdf{'\n'}
          <span className="c-a">  → Código/</span>      script.py{'\n'}
          <span className="c-a">  → Áudio/</span>       podcast.mp3{'\n'}
          <span className="c-a">  → Vídeos/</span>      aula.mp4{'\n'}
          <span className="c-ok">  ✓ simulação concluída: nada foi movido</span>
          {'\n'}
          <span className="c-p">$</span> <span className="art__caret" />
        </pre>
      </div>
    </div>
  );
}

export function CoverArt({ capa, eager = false }: { capa: Capa; eager?: boolean }) {
  if (capa.tipo === 'imagem') {
    return <img src={capa.src} alt={capa.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" width={1440} height={900} />;
  }
  switch (capa.arte) {
    case 'funil':
      return <Funil />;
    case 'catalogo':
      return <Catalogo />;
    case 'ads':
      return <Ads />;
    case 'marketplaces':
      return <Marketplaces />;
    case 'terminal':
      return <Terminal />;
  }
}
