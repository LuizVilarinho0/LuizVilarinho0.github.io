import type { CSSProperties } from 'react';

/**
 * Texto que "rola" letra por letra ao passar o mouse no elemento pai
 * (o pai precisa da classe .roll-host — links e botões do site já têm).
 */
export function RollText({ children }: { children: string }) {
  return (
    <span className="roll">
      <span className="sr-only">{children}</span>
      {Array.from(children).map((ch, i) => {
        const c = ch === ' ' ? '\u00A0' : ch;
        return (
          <span key={i} className="roll__ch" style={{ '--i': i } as CSSProperties} aria-hidden="true" data-ch={c}>
            {c}
          </span>
        );
      })}
    </span>
  );
}
