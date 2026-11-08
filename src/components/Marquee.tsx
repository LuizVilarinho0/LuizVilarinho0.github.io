import { Fragment } from 'react';
import { IconSpark } from './Icons';

interface Props {
  items: readonly string[];
  speed?: number; // segundos por volta
  reverse?: boolean;
  variant?: 'orange' | 'aqua' | 'outline' | 'ink';
  tilt?: number;
  big?: boolean;
}

/** Faixa infinita de palavras. */
export function Marquee({ items, speed = 38, reverse, variant = 'orange', tilt = 0, big }: Props) {
  const grupo = (copia: boolean) => (
    <div className="marquee__group" aria-hidden={copia || undefined}>
      {items.map((t, i) => (
        <Fragment key={i}>
          <span className="marquee__item">{t}</span>
          <IconSpark className="marquee__spark" width={big ? 34 : 18} height={big ? 34 : 18} />
        </Fragment>
      ))}
    </div>
  );
  return (
    <div className={`marquee marquee--${variant}${big ? ' marquee--big' : ''}`} style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}>
      <div className="marquee__track" style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}>
        {grupo(false)}
        {grupo(true)}
      </div>
    </div>
  );
}
