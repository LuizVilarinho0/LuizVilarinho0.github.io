import { site, whatsappLink } from '../config';
import { IconGithub, IconInstagram, IconLinkedin, IconWhatsapp } from './Icons';

export const redes = [
  { id: 'linkedin', rotulo: 'LinkedIn', href: site.redes.linkedin, Icon: IconLinkedin },
  { id: 'github', rotulo: 'GitHub', href: site.redes.github, Icon: IconGithub },
  { id: 'instagram', rotulo: 'Instagram', href: site.redes.instagram, Icon: IconInstagram },
  { id: 'whatsapp', rotulo: 'WhatsApp', href: whatsappLink(), Icon: IconWhatsapp },
].filter((r) => r.href);

export function SocialLinks({ className = 'socials', size = 18 }: { className?: string; size?: number }) {
  return (
    <ul className={className}>
      {redes.map(({ id, rotulo, href, Icon }) => (
        <li key={id}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={rotulo} title={rotulo}>
            <Icon width={size} height={size} />
          </a>
        </li>
      ))}
    </ul>
  );
}
