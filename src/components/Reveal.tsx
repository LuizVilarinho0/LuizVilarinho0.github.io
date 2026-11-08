import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article' | 'p' | 'span';
}

const ease = [0.16, 1, 0.3, 1] as const;

/** Faz o conteúdo surgir de baixo quando entra na tela. */
export function Reveal({ children, delay = 0, y = 40, className, as = 'div' }: Props) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </Tag>
  );
}

/** Uma linha de título que sobe de dentro de uma "máscara".
 *  Quem é observado é a máscara (o texto começa escondido fora dela). */
export function Line({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.span
      className={className ? `line-mask ${className}` : 'line-mask'}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -5% 0px' }}
    >
      <motion.span
        className="line-mask__in"
        variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 1, delay, ease } } }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
