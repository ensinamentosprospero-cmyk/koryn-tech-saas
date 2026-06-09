export const STORE = {
  name: 'Koryn Tech',
  tagline: 'Eletrônicos & Acessórios',
  phone: '5538999999999',
  phoneDisplay: '(38) 99999-9999',
  instagram: '@koryn_tech',
  instagramUrl: 'https://instagram.com/koryn_tech',
  city: 'Montes Claros - MG',
  hours: 'Segunda a Sexta: 8h às 18h\nSábado: 8h às 13h',
  description: 'Celulares e acessórios com atendimento rápido pelo WhatsApp.',
  deliveryTitle: 'Entrega grátis',
  deliveryDescription: 'Entrega ou retirada combinada pelo WhatsApp, conforme sua região.',
  heroBadge: 'Montes Claros · MG',
  heroTitleBefore: 'Celulares e acessórios com ',
  heroTitleHighlight: 'preço justo',
  heroTitleAfter: '.',
  heroSubtitle: 'Escolha o produto, chame no WhatsApp e combine pagamento e entrega.',
};

export const DEFAULT_AUTH = {
  adminEmail: 'admin@koryntech.com',
  adminPassword: 'korynadmin',
  userEmail: 'cliente@koryntech.com',
  userPassword: 'cliente123',
  registeredUsers: [],
};

export const NAV_LINKS = [
  { label: 'Ofertas', href: '#ofertas', section: 'ofertas' },
  { label: 'Produtos', href: '#produtos', section: 'produtos' },
  { label: 'Contato', href: '#contato', section: 'contato' },
];

export const BENEFITS = [
  { icon: 'shield', title: 'Garantia' },
  { icon: 'message', title: 'WhatsApp' },
  { icon: 'check', title: 'Produtos selecionados' },
  { icon: 'card', title: 'Pix e cartão' },
];

export const CATEGORY_TAGS = [
  'Celulares',
  'Carregadores',
  'Fones',
  'Películas',
  'Cabos',
  'Capinhas',
  'Kits',
];

export { PRODUCTS } from './products';

export const OFFERS = [
  {
    id: 1,
    name: 'Kit Carregamento',
    includes: ['Carregador turbo', 'Cabo USB-C'],
    price: 'R$ 79,90',
    savings: 'Compre o kit e economize',
    highlight: true,
    image: '/offers/kit-carregamento.jpg',
    imageAlt: 'Kit carregador turbo e cabo USB-C',
    description: 'Carregue seu celular com praticidade usando carregador turbo e cabo reforçado.',
    details: ['Carregador turbo', 'Cabo USB-C', 'Ideal para uso diário', 'Economia no combo'],
  },
  {
    id: 2,
    name: 'Kit Proteção',
    includes: ['Película 3D', 'Capinha'],
    price: 'R$ 59,90',
    savings: 'Proteção completa',
    highlight: false,
    image: '/offers/kit-protecao.jpg',
    imageAlt: 'Kit película 3D e capinha para celular',
    description: 'Proteja tela e corpo do aparelho com película e capinha no mesmo kit.',
    details: ['Película 3D', 'Capinha resistente', 'Proteção frontal e traseira', 'Diversos modelos'],
  },
  {
    id: 3,
    name: 'Kit Áudio',
    includes: ['Fone Bluetooth TWS', 'Case para fones'],
    price: 'R$ 119,90',
    savings: 'Som + proteção',
    highlight: false,
    image: '/offers/kit-audio.jpg',
    imageAlt: 'Kit fone Bluetooth e case para fones',
    description: 'Ouça música com qualidade e guarde os fones com case compacto.',
    details: ['Fone Bluetooth TWS', 'Case para fones', 'Boa autonomia', 'Som limpo'],
  },
  {
    id: 4,
    name: 'Kit Essencial',
    includes: ['Película 3D', 'Cabo USB-C'],
    price: 'R$ 49,90',
    savings: 'Básico com desconto',
    highlight: false,
    image: '/offers/kit-essencial.jpg',
    imageAlt: 'Kit película 3D e cabo USB-C',
    description: 'O básico bem feito: proteção para a tela e cabo para recarregar.',
    details: ['Película 3D', 'Cabo USB-C', 'Preço acessível', 'Pronto para usar'],
  },
  {
    id: 5,
    name: 'Kit Veicular',
    includes: ['Carregador veicular', 'Suporte para celular'],
    price: 'R$ 89,90',
    savings: 'Ideal para o carro',
    highlight: false,
    image: '/offers/kit-veicular.jpg',
    imageAlt: 'Kit carregador veicular e suporte para celular',
    description: 'Carregue e use o celular com segurança durante a viagem.',
    details: ['Carregador veicular', 'Suporte ajustável', 'Fixação firme', 'Uso no carro'],
  },
  {
    id: 6,
    name: 'Combo Turbo',
    includes: ['Carregador turbo', 'Película 3D', 'Capinha'],
    price: 'R$ 99,90',
    savings: 'Mais vendido',
    highlight: false,
    image: '/offers/combo-turbo.jpg',
    imageAlt: 'Combo carregador, película e capinha',
    description: 'Carregamento, proteção de tela e capinha em um combo completo.',
    details: ['Carregador turbo', 'Película 3D', 'Capinha', 'Melhor custo-benefício'],
  },
];

export const WHY_CHOOSE_US = [
  {
    icon: 'zap',
    title: 'Atendimento rápido',
    text: 'Compre direto pelo WhatsApp.',
  },
  {
    icon: 'shield',
    title: 'Garantia',
    text: 'Produtos com garantia informada.',
  },
  {
    icon: 'tag',
    title: 'Preço justo',
    text: 'Boa qualidade e custo-benefício.',
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Escolha',
    text: 'Veja os produtos ou peça indicação.',
    icon: 'search',
  },
  {
    step: 2,
    title: 'WhatsApp',
    text: 'Confirme preço e pagamento.',
    icon: 'message',
  },
  {
    step: 3,
    title: 'Entrega',
    text: 'Combine retirada ou entrega.',
    icon: 'truck',
  },
  {
    step: 4,
    title: 'Pronto',
    text: 'Produto conferido com garantia.',
    icon: 'shield',
  },
];

export const FAQS = [
  {
    question: 'Posso comprar pelo WhatsApp?',
    answer: 'Sim. Escolha o produto e chame no WhatsApp para confirmar disponibilidade e pagamento.',
  },
  {
    question: 'Os produtos têm garantia?',
    answer: 'Sim. A garantia é informada no momento da compra.',
  },
  {
    question: 'Vocês entregam?',
    answer: 'Entrega ou retirada combinada pelo WhatsApp, conforme sua região.',
  },
  {
    question: 'Aceitam cartão?',
    answer: 'Sim. Pix, cartão ou dinheiro, conforme combinado no atendimento.',
  },
];
