/*
 * Monograma LV: o "L" e o braço direito do "V" formam uma única linha em
 * "taco de hóquei" — o gráfico de crescimento — que termina numa seta.
 * E-commerce (vendas subindo) + tecnologia (traço geométrico e preciso).
 */

export const MARCA_CORPO =
  'M10 10 L24 10 L24 76 L53.52 76 L70.87 32.62 L83.87 37.82 L63 90 L10 90 Z M33 10 L48.08 10 L64 49.8 L56.46 68.65 Z';
export const MARCA_SETA = 'M61.41 32.06 L85.17 15.72 L91.12 43.94 Z';

interface MarkProps {
  size?: number;
  className?: string;
  /** cor do corpo (padrão: cor do texto) */
  cor?: string;
  /** cor da seta (padrão: laranja da marca) */
  seta?: string;
  title?: string;
}

export function LogoMark({ size = 40, className, cor = 'currentColor', seta = 'var(--orange)', title }: MarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={MARCA_CORPO} fill={cor} />
      <path d={MARCA_SETA} fill={seta} className="logo-seta" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`logo${compact ? ' logo--compact' : ''}`}>
      <LogoMark size={34} />
      {!compact && (
        <span className="logo__txt">
          <b>Luiz</b>
          <b>Vilarinho</b>
        </span>
      )}
    </span>
  );
}
