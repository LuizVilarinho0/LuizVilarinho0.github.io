import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useIntroDone } from './Loader';

/*
 * Painel do topo (no lugar da foto): o encontro das duas áreas.
 * Em cima, a curva de crescimento — o mesmo "taco de hóquei" da logo — se desenhando.
 * Embaixo, um terminal que digita linhas de código sobre e-commerce.
 * Sem números inventados: é ilustração, não relatório.
 */

const LINHAS = [
  "pedidos.filter(p => p.status === 'pago')",
  'SELECT canal, SUM(receita) FROM vendas GROUP BY canal;',
  'margem = (preco - custo - taxas) / preco',
  '<Anuncio titulo="otimizado" preco="competitivo" />',
  'estoque.repor(produtos.filter(giroAlto))',
];

function Digitando() {
  const reduce = useReducedMotion();
  const [linha, setLinha] = useState(0);
  const [n, setN] = useState(reduce ? LINHAS[0].length : 0);

  useEffect(() => {
    if (reduce) return;
    const alvo = LINHAS[linha];
    if (n < alvo.length) {
      const t = window.setTimeout(() => setN(n + 1), 38 + Math.random() * 40);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setLinha((l) => (l + 1) % LINHAS.length);
      setN(0);
    }, 2200);
    return () => window.clearTimeout(t);
  }, [n, linha, reduce]);

  return (
    <code>
      {LINHAS[linha].slice(0, n)}
      <span className="hv__caret" aria-hidden="true" />
    </code>
  );
}

const CHIPS = [
  { t: 'Marketplaces', x: '8%', y: '20%', r: -6, d: 0 },
  { t: 'Meta Ads', x: '58%', y: '9%', r: 5, d: 0.6 },
  { t: 'React', x: '70%', y: '40%', r: -4, d: 1.2 },
  { t: 'SQL', x: '14%', y: '47%', r: 7, d: 1.8 },
];

export function HeroVisual() {
  const pronto = useIntroDone();
  const curva = 'M24 60 V200 H170 L268 52';

  return (
    <div className="hv" aria-hidden="true">
      <div className="hv__top">
        <span className="hv__tag">e-commerce × código</span>
        <span className="hv__live">
          <i /> ao vivo
        </span>
      </div>

      <div className="hv__chart">
        <svg viewBox="0 0 300 230" preserveAspectRatio="xMidYMid meet">
          {[60, 107, 154, 200].map((y) => (
            <line key={y} x1="10" x2="290" y1={y} y2={y} className="hv__grid" />
          ))}
          <motion.path
            d={curva}
            className="hv__line"
            initial={{ pathLength: 0 }}
            animate={pronto ? { pathLength: 1 } : undefined}
            transition={{ duration: 1.6, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
          />
          <motion.path
            d="M259.7 46.5 L278 37 L276.3 57.5 Z"
            className="hv__arrow"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={pronto ? { opacity: 1, scale: 1 } : undefined}
            style={{ transformOrigin: '268px 52px' }}
            transition={{ duration: 0.5, delay: 1.75, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.circle
            cx="170"
            cy="200"
            r="7"
            className="hv__dot"
            initial={{ scale: 0 }}
            animate={pronto ? { scale: 1 } : undefined}
            transition={{ duration: 0.4, delay: 1.2 }}
          />
        </svg>

        {CHIPS.map((c) => (
          <span key={c.t} className="hv__chip" style={{ left: c.x, top: c.y, rotate: `${c.r}deg`, animationDelay: `${c.d}s` }}>
            {c.t}
          </span>
        ))}
      </div>

      <div className="hv__term">
        <span className="hv__prompt">~/lv $</span>
        <Digitando />
      </div>
    </div>
  );
}
