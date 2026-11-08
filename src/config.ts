// =============================================================
//  CONFIGURAÇÃO PÚBLICA DO SITE — contatos, redes e currículo
//  (dados secretos, como a senha do e-mail, ficam em
//   public/api/config.php, que o navegador nunca vê)
// =============================================================

export const site = {
  nome: 'Luiz Vilarinho',
  cargo: 'Analista de E-commerce',
  cidade: 'Ribeirão Preto · SP',

  /** WhatsApp com DDI + DDD, só números. */
  whatsapp: '5516994157389',
  whatsappExibicao: '+55 16 99415-7389',

  email: 'luizvilarinho948@gmail.com',

  /** Deixe vazio ('') para esconder a rede do site. */
  redes: {
    linkedin: 'https://www.linkedin.com/in/luiz-vilarinho-b0b5272b6/',
    github: 'https://github.com/LuizVilarinho0',
    instagram: 'https://www.instagram.com/luizvilarinhoo/',
  },

  /** Arquivo em public/curriculo/ */
  curriculo: '/curriculo/Luiz_Vilarinho_Curriculo_2026.pdf',

  /** Mostra o selo "disponível" no topo do site. */
  disponivel: true,

  apiBase: '/api',

  /**
   * true no GitHub Pages (que não roda PHP): o formulário envia pelo FormSubmit.
   */
  estatico: import.meta.env.VITE_ESTATICO === '1',
} as const;

export const whatsappLink = (texto = 'Olá, Luiz! Vim pelo seu portfólio.') =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`;
