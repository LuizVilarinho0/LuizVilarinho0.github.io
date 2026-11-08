import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MARCA_CORPO, MARCA_SETA } from './Logo';

/*
 * Tela de abertura: a logo se desenha, o contador vai a 100 e a cortina sobe.
 * Aparece só na primeira visita da sessão (e nunca com "reduzir movimento").
 * O contexto avisa a página quando a abertura terminou, para o título animar na hora certa.
 */

const IntroContext = createContext(true);
export const useIntroDone = () => useContext(IntroContext);

const CHAVE = 'lv-intro-vista';

function jaViu(): boolean {
  try {
    return sessionStorage.getItem(CHAVE) === '1';
  } catch {
    return false;
  }
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [ativo, setAtivo] = useState(() => !jaViu());
  const [pronto, setPronto] = useState(() => jaViu());
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!ativo) return;
    if (reduce) {
      setAtivo(false);
      setPronto(true);
      return;
    }
    document.documentElement.style.overflow = 'hidden';
    const inicio = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - inicio) / dur);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else
        window.setTimeout(() => {
          try {
            sessionStorage.setItem(CHAVE, '1');
          } catch {
            /* sem storage: tudo bem */
          }
          setAtivo(false);
          // o título começa a animar enquanto a cortina ainda está subindo
          window.setTimeout(() => setPronto(true), 420);
        }, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ativo, reduce]);

  return (
    <IntroContext.Provider value={pronto}>
      {children}
      <AnimatePresence
        onExitComplete={() => {
          document.documentElement.style.overflow = '';
          setPronto(true);
        }}
      >
        {ativo && !reduce && (
          <motion.div
            className="loader"
            key="loader"
            exit={{ y: '-100%' }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 100 100" className="loader__mark">
              <defs>
                <clipPath id="loader-clip">
                  <motion.rect
                    x="0"
                    width="100"
                    initial={{ y: 100, height: 0 }}
                    animate={{ y: 0, height: 100 }}
                    transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
                  />
                </clipPath>
              </defs>
              <path d={MARCA_CORPO} fill="var(--paper)" clipPath="url(#loader-clip)" />
              <motion.path
                d={MARCA_SETA}
                fill="var(--orange)"
                initial={{ opacity: 0, x: -14, y: 14 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="loader__foot">
              <span>Luiz Vilarinho</span>
              <span>E-commerce × Tecnologia</span>
              <span className="loader__count">{String(n).padStart(3, '0')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
