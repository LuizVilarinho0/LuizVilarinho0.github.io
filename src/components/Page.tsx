import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  className?: string;
  children: ReactNode;
}

/** Envelope de toda página: título da aba, scroll e cortina de transição. */
export function Page({ title, className, children }: Props) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // espera a página montar para rolar até a seção
      const t = window.setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 450);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <motion.main
      id="conteudo"
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="curtain"
        aria-hidden="true"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
      />
      {children}
    </motion.main>
  );
}
