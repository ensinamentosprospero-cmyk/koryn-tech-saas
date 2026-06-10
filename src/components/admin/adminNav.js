export const ADMIN_PAGES = {
  dashboard: {
    title: 'Dashboard',
    description: 'Visão completa da sua loja online',
    group: 'Principal',
  },
  loja: {
    title: 'Identidade da loja',
    description: 'Nome, logo, banner e descrição exibidos no site',
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
  tema: {
    title: 'Cores do tema',
    description: 'Cor principal e secundária da loja',
    group: 'Minha loja',
  },
  categorias: {
    title: 'Categorias',
    description: 'Filtros e agrupamento de produtos',
    group: 'Catálogo',
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
  textos: {
    title: 'Textos do site',
    description: 'Títulos das seções e botões principais',
    group: 'Página',
  },
  faq: {
    title: 'Perguntas frequentes',
    description: 'Dúvidas e respostas exibidas no FAQ',
    group: 'Página',
  },
  assinatura: {
    title: 'Assinatura',
    description: 'Trial, plano atual e upgrade da loja',
    group: 'Principal',
  },
};

export const ADMIN_NAV = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'smartphone' },
      { id: 'assinatura', label: 'Assinatura', icon: 'star' },
    ],
  },
  {
    label: 'Minha loja',
    items: [
      { id: 'loja', label: 'Identidade', icon: 'smartphone' },
      { id: 'contato', label: 'Contato', icon: 'whatsapp' },
      { id: 'entrega', label: 'Entrega', icon: 'truck' },
      { id: 'mensagens', label: 'WhatsApp', icon: 'message' },
      { id: 'tema', label: 'Tema', icon: 'star' },
      { id: 'acesso', label: 'Senhas', icon: 'user' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { id: 'categorias', label: 'Categorias', icon: 'tag' },
      { id: 'produtos', label: 'Produtos', icon: 'tag' },
      { id: 'ofertas', label: 'Ofertas', icon: 'star' },
    ],
  },
  {
    label: 'Página',
    items: [
      { id: 'secoes', label: 'Seções', icon: 'check' },
      { id: 'textos', label: 'Textos', icon: 'message' },
      { id: 'faq', label: 'FAQ', icon: 'message' },
    ],
  },
];

export const ADMIN_MOBILE_NAV = ADMIN_NAV.flatMap((group) => group.items);
