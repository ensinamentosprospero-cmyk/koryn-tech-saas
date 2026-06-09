export const ADMIN_PAGES = {
  dashboard: {
    title: 'Dashboard',
    description: 'Visão completa da sua loja online',
    group: 'Principal',
  },
  loja: {
    title: 'Identidade da loja',
    description: 'Nome, tagline e descrição exibidos no site',
    group: 'Minha loja',
  },
  contato: {
    title: 'Contato',
    description: 'WhatsApp, Instagram e informações de atendimento',
    group: 'Minha loja',
  },
  entrega: {
    title: 'Entrega',
    description: 'Textos de entrega nos detalhes de produtos e ofertas',
    group: 'Minha loja',
  },
  mensagens: {
    title: 'Mensagens WhatsApp',
    description: 'Texto padrão enviado pelos botões do site',
    group: 'Minha loja',
  },
  acesso: {
    title: 'Senhas de acesso',
    description: 'Login do visitante e do administrador',
    group: 'Minha loja',
  },
  produtos: {
    title: 'Produtos',
    description: 'Gerencie o catálogo completo da loja',
    group: 'Catálogo',
  },
  ofertas: {
    title: 'Ofertas',
    description: 'Kits promocionais do carrossel principal',
    group: 'Catálogo',
  },
  secoes: {
    title: 'Seções do site',
    description: 'Controle o que aparece na página pública',
    group: 'Página',
  },
  faq: {
    title: 'Perguntas frequentes',
    description: 'Dúvidas e respostas exibidas no FAQ',
    group: 'Página',
  },
};

export const ADMIN_NAV = [
  {
    label: 'Principal',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: 'smartphone' }],
  },
  {
    label: 'Minha loja',
    items: [
      { id: 'loja', label: 'Identidade', icon: 'smartphone' },
      { id: 'contato', label: 'Contato', icon: 'whatsapp' },
      { id: 'entrega', label: 'Entrega', icon: 'truck' },
      { id: 'mensagens', label: 'WhatsApp', icon: 'message' },
      { id: 'acesso', label: 'Senhas', icon: 'user' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { id: 'produtos', label: 'Produtos', icon: 'tag' },
      { id: 'ofertas', label: 'Ofertas', icon: 'star' },
    ],
  },
  {
    label: 'Página',
    items: [
      { id: 'secoes', label: 'Seções', icon: 'check' },
      { id: 'faq', label: 'FAQ', icon: 'message' },
    ],
  },
];

export const ADMIN_MOBILE_NAV = ADMIN_NAV.flatMap((group) => group.items);
