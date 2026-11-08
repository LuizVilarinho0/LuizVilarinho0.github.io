import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { site } from '../config';
import { IconArrowUpRight } from './Icons';
import { Logo } from './Logo';
import { RollText } from './RollText';
import { SocialLinks } from './SocialLinks';

export const LINKS = [
  { to: '/trabalhos', label: 'Trabalhos' },
  { to: '/#sobre', label: 'Sobre' },
  { to: '/#experiencia', label: 'Experiência' },
  { to: '/agendar', label: 'Agendar' },
  { to: '/contato', label: 'Contato' },
];

/** Link que também funciona para âncoras da home (/#sobre) quando já estamos nela. */
export function SmartLink({ to, children, className, onClick, ...rest }: { to: string; children: ReactNode; className?: string; onClick?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [path, hash] = to.split('#');
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    if (hash && (path || '/') === location.pathname) {
      e.preventDefault();
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      navigate(`${location.pathname}#${hash}`, { replace: true });
    }
  };
  return (
    <Link to={to} className={className} onClick={handle} {...rest}>
      {children}
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 400 && y > prev + 2 && !open);
  });

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open]);

  const ativo = (to: string) => !to.includes('#') && location.pathname.startsWith(to);

  return (
    <>
      <motion.header
        className={`hdr${scrolled && !open ? ' hdr--solid' : ''}${open ? ' hdr--menu' : ''}`}
        animate={{ y: hidden ? '-110%' : '0%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to="/" className="hdr__logo" aria-label="Luiz Vilarinho — início">
          <Logo />
        </Link>

        <nav className="hdr__nav" aria-label="Principal">
          {LINKS.slice(0, 4).map((l) => (
            <SmartLink key={l.to} to={l.to} className={`roll-host${ativo(l.to) ? ' is-active' : ''}`}>
              <RollText>{l.label}</RollText>
            </SmartLink>
          ))}
        </nav>

        <div className="hdr__right">
          <SocialLinks className="socials hdr__socials" size={17} />
          <Link to="/contato" className="btn btn--sm btn--paper roll-host hdr__cta">
            <RollText>Contato</RollText>
            <IconArrowUpRight width={16} height={16} />
          </Link>
          <button
            className="hdr__burger"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            <span />
            <span />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            className="mmenu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Menu">
              <ol>
                {[{ to: '/', label: 'Início' }, ...LINKS].map((l, i) => (
                  <motion.li
                    key={l.to}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <SmartLink to={l.to} onClick={() => setOpen(false)}>
                      <small>0{i + 1}</small>
                      {l.label}
                    </SmartLink>
                  </motion.li>
                ))}
              </ol>
            </nav>
            <div className="mmenu__foot">
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <SocialLinks size={22} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
