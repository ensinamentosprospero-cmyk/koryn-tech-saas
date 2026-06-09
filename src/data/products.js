const PAYMENT = 'Pix, cartão ou dinheiro';

function item(category, image, name, price, badge, badgeColor, description, details) {
  return { category, image, name, price, badge, badgeColor, description, details, payment: PAYMENT };
}

const catalog = [
  ...[
    item('Celulares', 'smartphone', 'Smartphone Galaxy A15 128GB', 'R$ 1.199,90', 'Mais vendido', 'blue', 'Boa bateria e desempenho para o dia a dia.', ['128GB', 'Garantia informada', 'Ótimo custo-benefício']),
    item('Celulares', 'smartphone', 'Smartphone Galaxy A05 64GB', 'R$ 699,90', 'Econômico', 'green', 'Ideal para uso básico e redes sociais.', ['64GB', 'Dual chip', 'Bateria durável']),
    item('Celulares', 'smartphone', 'Redmi Note 13 128GB', 'R$ 1.099,90', 'Custo-benefício', 'orange', 'Tela ampla e boa câmera.', ['128GB', 'Carregamento rápido', 'Desempenho equilibrado']),
    item('Celulares', 'iphone', 'iPhone 11 64GB', 'R$ 2.499,90', 'Premium', 'slate', 'Apple com desempenho confiável.', ['64GB', 'iOS', 'Câmera dupla']),
    item('Celulares', 'smartphone', 'Moto G54 128GB', 'R$ 999,90', 'Popular', 'blue', 'Ótimo para trabalho e lazer.', ['128GB', '5G', 'Som estéreo']),
    item('Celulares', 'smartphone', 'Galaxy A25 256GB', 'R$ 1.349,90', 'Novo', 'purple', 'Mais espaço e fluidez no dia a dia.', ['256GB', 'Tela Super AMOLED', 'Garantia informada']),
    item('Celulares', 'smartphone', 'Realme C55 128GB', 'R$ 849,90', 'Oferta', 'orange', 'Leve, rápido e com boa autonomia.', ['128GB', 'Carregamento 33W', 'Design fino']),
    item('Celulares', 'smartphone', 'Poco X6 256GB', 'R$ 1.599,90', 'Performance', 'blue', 'Indicado para jogos e multitarefa.', ['256GB', 'Snapdragon', 'Tela 120Hz']),
    item('Celulares', 'smartphone', 'Galaxy A35 128GB', 'R$ 1.449,90', 'Destaque', 'green', 'Equilíbrio entre câmera e bateria.', ['128GB', 'IP67', 'Atualizações Samsung']),
    item('Celulares', 'smartphone', 'Moto G84 256GB', 'R$ 1.299,90', 'Favorito', 'purple', 'Tela pOLED e acabamento premium.', ['256GB', 'OIS na câmera', 'Carregamento turbo']),
  ],
  ...[
    item('Carregadores', 'charger', 'Carregador Turbo USB-C 20W', 'R$ 59,90', 'Oferta', 'orange', 'Carregamento rápido e compacto.', ['20W turbo', 'Entrada USB-C', 'Uso diário']),
    item('Carregadores', 'charger', 'Carregador Turbo USB-C 30W', 'R$ 69,90', 'Rápido', 'blue', 'Mais potência para recarga expressa.', ['30W turbo', 'USB-C', 'Compacto']),
    item('Carregadores', 'charger', 'Carregador Dual USB 2 Portas', 'R$ 49,90', 'Prático', 'green', 'Carregue dois aparelhos ao mesmo tempo.', ['2 portas USB', 'Proteção térmica', 'Uso em casa']),
    item('Carregadores', 'charger', 'Carregador Wireless 15W', 'R$ 89,90', 'Sem fio', 'purple', 'Recarga prática sem cabos.', ['15W wireless', 'Compatível Qi', 'Base antiderrapante']),
    item('Carregadores', 'charger', 'Fonte USB-C 65W Notebook', 'R$ 129,90', 'Potente', 'slate', 'Ideal para notebook e celular.', ['65W PD', 'USB-C', 'Carregamento universal']),
    item('Carregadores', 'charger', 'Carregador Lightning iPhone', 'R$ 54,90', 'Apple', 'slate', 'Compatível com iPhone Lightning.', ['Certificado', 'Carga estável', 'Cabos originais ou compatíveis']),
    item('Carregadores', 'car', 'Carregador Veicular 2 Portas', 'R$ 44,90', 'Veicular', 'orange', 'Perfeito para usar no carro.', ['2 USB', '12V/24V', 'Proteção contra surtos']),
    item('Carregadores', 'charger', 'Carregador Magnético MagSafe', 'R$ 99,90', 'Magnético', 'blue', 'Encaixe magnético para iPhone.', ['MagSafe', '15W', 'Fixação firme']),
    item('Carregadores', 'charger', 'Adaptador de Tomada USB-C', 'R$ 39,90', 'Compacto', 'green', 'Fonte básica para recarga diária.', ['USB-C', 'Leve', 'Viagem']),
    item('Carregadores', 'charger', 'Power Bank 10000mAh', 'R$ 119,90', 'Portátil', 'purple', 'Energia extra onde você estiver.', ['10000mAh', 'USB-C in/out', 'Indicador LED']),
  ],
  ...[
    item('Fones', 'headphones', 'Fone Bluetooth TWS', 'R$ 89,90', 'Novo', 'purple', 'Som limpo e boa bateria.', ['Bluetooth estável', 'Confortável', 'Boa autonomia']),
    item('Fones', 'headphones', 'Fone Bluetooth Over-Ear', 'R$ 149,90', 'Conforto', 'blue', 'Graves potentes e isolamento acústico.', ['Over-ear', 'Bateria longa', 'Dobrável']),
    item('Fones', 'headphones', 'Fone com Fio P2', 'R$ 29,90', 'Econômico', 'green', 'Simples e confiável para o dia a dia.', ['Entrada P2', 'Microfone inline', 'Leve']),
    item('Fones', 'headphones', 'Fone Esportivo IPX5', 'R$ 79,90', 'Esportivo', 'orange', 'Resistente à água e suor.', ['IPX5', 'Fixação segura', 'Bluetooth 5.3']),
    item('Fones', 'headphones', 'Fone Gamer com Microfone', 'R$ 129,90', 'Gamer', 'slate', 'Áudio imersivo para jogos.', ['Microfone destacável', 'Conforto prolongado', 'Graves reforçados']),
    item('Fones', 'headphones', 'Fone Infantil Bluetooth', 'R$ 69,90', 'Infantil', 'green', 'Volume limitado para crianças.', ['Limite de volume', 'Design colorido', 'Bluetooth']),
    item('Fones', 'headphones', 'Fone Neckband Bluetooth', 'R$ 59,90', 'Neckband', 'blue', 'Prático para usar em movimento.', ['Neckband', 'Controles integrados', 'Autonomia média']),
    item('Fones', 'headphones', 'Fone TWS Pro Cancelamento', 'R$ 179,90', 'Premium', 'purple', 'Reduz ruídos externos com qualidade.', ['ANC', 'Estojo carregador', 'Toque inteligente']),
    item('Fones', 'headphones', 'Fone TWS Compacto', 'R$ 74,90', 'Compacto', 'orange', 'Estojo pequeno e fácil de carregar.', ['Estojo slim', 'Bluetooth 5.0', 'Boa bateria']),
    item('Fones', 'headphones', 'Fone TWS Touch Screen', 'R$ 199,90', 'Exclusivo', 'slate', 'Case com display e controles avançados.', ['Case com tela', 'ANC básico', 'Som premium']),
  ],
  ...[
    item('Películas', 'film', 'Película 3D Privacidade', 'R$ 39,90', 'Proteção', 'slate', 'Proteção e privacidade para a tela.', ['Proteção 3D', 'Efeito privacidade', 'Diversos modelos']),
    item('Películas', 'film', 'Película de Vidro 9H', 'R$ 29,90', '9H', 'blue', 'Alta resistência a riscos.', ['Vidro temperado', 'Bordas arredondadas', 'Fácil instalação']),
    item('Películas', 'film', 'Película Hidrogel', 'R$ 34,90', 'Hidrogel', 'green', 'Flexível e auto-regenerável.', ['Anti-risco', 'Toque suave', 'Curvas completas']),
    item('Películas', 'film', 'Película Anti-Reflexo', 'R$ 32,90', 'Anti-reflexo', 'orange', 'Melhor visibilidade sob luz forte.', ['Matte finish', 'Anti-impressão digital', 'Proteção extra']),
    item('Películas', 'film', 'Película Privacidade Full', 'R$ 44,90', 'Privacidade', 'slate', 'Privacidade total em ambientes públicos.', ['Full cover', 'Anti-espionagem', 'Vidro 9H']),
    item('Películas', 'film', 'Película para Câmera', 'R$ 19,90', 'Câmera', 'purple', 'Protege as lentes sem perder qualidade.', ['Lente câmera', 'Transparente', 'Kit multi-modelos']),
    item('Películas', 'film', 'Película para Tablet', 'R$ 49,90', 'Tablet', 'blue', 'Proteção reforçada para telas grandes.', ['Tablet 10"', 'Vidro 9H', 'Instalação assistida']),
    item('Películas', 'film', 'Película Nano Flexível', 'R$ 27,90', 'Nano', 'green', 'Leve, fina e resistente.', ['Nano flex', 'Auto-cura leve', 'Compatível curvas']),
    item('Películas', 'film', 'Película 3D Transparente', 'R$ 24,90', 'Transparente', 'orange', 'Proteção discreta sem alterar a tela.', ['3D full', 'Alta transparência', 'Anti-risco']),
    item('Películas', 'film', 'Película com Aplicador', 'R$ 36,90', 'Kit', 'blue', 'Instalação mais fácil com ferramentas.', ['Aplicador incluso', 'Sem bolhas', 'Vidro 9H']),
  ],
  ...[
    item('Cabos', 'cable', 'Cabo USB-C Reforçado 1m', 'R$ 29,90', 'Resistente', 'blue', 'Cabo reforçado para uso diário.', ['1 metro', 'Nylon reforçado', 'Carga e dados']),
    item('Cabos', 'cable', 'Cabo Lightning 1m', 'R$ 34,90', 'Lightning', 'slate', 'Compatível com iPhone e iPad.', ['1 metro', 'Carga rápida', 'Nylon trançado']),
    item('Cabos', 'cable', 'Cabo USB-C 2m', 'R$ 39,90', '2 metros', 'green', 'Mais alcance para carregar longe da tomada.', ['2 metros', 'USB-C', 'Reforçado']),
    item('Cabos', 'cable', 'Cabo USB-C 90° Gaming', 'R$ 42,90', 'Gamer', 'purple', 'Conector em L ideal para jogar carregando.', ['Conector 90°', 'USB-C', 'Alta durabilidade']),
    item('Cabos', 'cable', 'Cabo Micro USB 1m', 'R$ 19,90', 'Micro USB', 'orange', 'Para aparelhos com entrada micro USB.', ['1 metro', 'Carga estável', 'Revestimento reforçado']),
    item('Cabos', 'cable', 'Cabo USB-C para Lightning', 'R$ 49,90', 'Combo', 'blue', 'Conecte iPhone em fontes USB-C.', ['USB-C para Lightning', 'PD compatível', '1 metro']),
    item('Cabos', 'cable', 'Cabo Nylon Trançado 1.5m', 'R$ 36,90', 'Premium', 'slate', 'Acabamento premium e alta resistência.', ['1,5 metro', 'Nylon trançado', 'Transferência de dados']),
    item('Cabos', 'cable', 'Cabo USB-C 3m', 'R$ 54,90', '3 metros', 'green', 'Extra longo para sofá, cama ou escritório.', ['3 metros', 'USB-C', 'Alta flexibilidade']),
    item('Cabos', 'cable', 'Cabo Magnético USB-C', 'R$ 59,90', 'Magnético', 'purple', 'Encaixe magnético prático e moderno.', ['Conector magnético', 'USB-C', 'Evita desgaste']),
    item('Cabos', 'cable', 'Cabo Duo USB-C/Lightning', 'R$ 64,90', '2 em 1', 'orange', 'Um cabo para Android e iPhone.', ['2 pontas', 'Carga rápida', 'Viagem']),
  ],
  ...[
    item('Capinhas', 'case', 'Capinha Anti-Impacto', 'R$ 34,90', 'Proteção', 'slate', 'Proteção extra contra quedas.', ['Anti-impacto', 'Diversos modelos', 'Boa aderência']),
    item('Capinhas', 'case', 'Capinha de Silicone', 'R$ 24,90', 'Silicone', 'green', 'Macia, leve e confortável na mão.', ['Silicone flexível', 'Anti-derrapante', 'Várias cores']),
    item('Capinhas', 'case', 'Capinha Transparente', 'R$ 19,90', 'Transparente', 'blue', 'Mostra o design original do aparelho.', ['Crystal clear', 'Anti-amarelamento', 'Slim']),
    item('Capinhas', 'case', 'Capinha com Anel', 'R$ 39,90', 'Anel', 'purple', 'Anel giratório para segurar e apoiar.', ['Anel 360°', 'Grip firme', 'Proteção lateral']),
    item('Capinhas', 'case', 'Capinha Carteira', 'R$ 49,90', 'Carteira', 'orange', 'Guarda cartões junto com o celular.', ['Bolso para cartões', 'Fecho magnético', 'Proteção frontal']),
    item('Capinhas', 'case', 'Capinha Antiderrapante', 'R$ 27,90', 'Grip', 'green', 'Textura que evita escorregar.', ['Textura grip', 'Leve', 'Bordas elevadas']),
    item('Capinhas', 'case', 'Capinha Premium Couro', 'R$ 59,90', 'Premium', 'slate', 'Visual elegante com toque sofisticado.', ['Acabamento couro', 'Slim premium', 'Proteção completa']),
    item('Capinhas', 'case', 'Capinha Slim Colorida', 'R$ 22,90', 'Color', 'blue', 'Fina, colorida e prática.', ['Ultra slim', 'Cores variadas', 'Leve']),
    item('Capinhas', 'case', 'Capinha com Alça', 'R$ 44,90', 'Alça', 'purple', 'Alça removível para mais segurança.', ['Alça destacável', 'Anti-queda', 'Material resistente']),
    item('Capinhas', 'case', 'Capinha MagSafe', 'R$ 69,90', 'MagSafe', 'orange', 'Compatível com acessórios magnéticos.', ['MagSafe', 'Encaixe perfeito', 'Proteção reforçada']),
  ],
  ...[
    item('Kits', 'charger', 'Kit Acessórios Essencial', 'R$ 69,90', 'Kit', 'green', 'Película, cabo e capinha no mesmo kit.', ['Película 3D', 'Cabo USB-C', 'Capinha básica']),
    item('Kits', 'film', 'Kit Proteção Total', 'R$ 79,90', 'Proteção', 'slate', 'Película + capinha anti-impacto.', ['Película 9H', 'Capinha reforçada', 'Economia no combo']),
    item('Kits', 'charger', 'Kit Carregamento Completo', 'R$ 99,90', 'Carregamento', 'orange', 'Fonte turbo + cabo reforçado.', ['Carregador 30W', 'Cabo nylon', 'Pronto para uso']),
    item('Kits', 'car', 'Kit Viagem', 'R$ 119,90', 'Viagem', 'blue', 'Power bank, cabo e adaptador.', ['Power bank', 'Cabo USB-C', 'Adaptador compacto']),
    item('Kits', 'headphones', 'Kit Gamer', 'R$ 149,90', 'Gamer', 'purple', 'Fone gamer + cabo 90° + capinha grip.', ['Fone gamer', 'Cabo 90°', 'Capinha grip']),
    item('Kits', 'charger', 'Kit Escritório', 'R$ 129,90', 'Escritório', 'green', 'Fonte 65W + cabo 2m + suporte básico.', ['Fonte 65W', 'Cabo 2m', 'Suporte mesa']),
    item('Kits', 'car', 'Kit Veicular', 'R$ 89,90', 'Veicular', 'orange', 'Carregador veicular + suporte + cabo.', ['Carregador carro', 'Suporte ventosa', 'Cabo USB-C']),
    item('Kits', 'case', 'Kit Família', 'R$ 159,90', 'Família', 'blue', '2 películas + 2 capinhas + 2 cabos.', ['2 películas', '2 capinhas', '2 cabos']),
    item('Kits', 'smartphone', 'Kit Premium', 'R$ 199,90', 'Premium', 'slate', 'Capinha premium + película + fone TWS.', ['Capinha premium', 'Película 9H', 'Fone TWS']),
    item('Kits', 'cable', 'Kit Básico Econômico', 'R$ 49,90', 'Econômico', 'green', 'Película básica + cabo + capinha slim.', ['Película básica', 'Cabo 1m', 'Capinha slim']),
  ],
];

const CATEGORY_PHOTOS = {
  Celulares: ['/products/celulares-1.jpg', '/products/celulares-2.jpg'],
  Carregadores: ['/products/carregadores-1.jpg', '/products/carregadores-2.jpg'],
  Fones: ['/products/fones-1.jpg', '/products/fones-2.jpg'],
  Películas: ['/products/peliculas-1.jpg', '/products/peliculas-2.jpg'],
  Cabos: ['/products/cabos-1.jpg', '/products/cabos-2.jpg'],
  Capinhas: ['/products/capinhas-1.jpg', '/products/capinhas-2.jpg'],
  Kits: ['/products/kits-1.jpg', '/products/kits-2.jpg'],
};

const categoryPhotoIndex = {};

export const PRODUCTS = catalog.map((product, index) => {
  const photoIndex = categoryPhotoIndex[product.category] ?? 0;
  categoryPhotoIndex[product.category] = photoIndex + 1;
  const photos = CATEGORY_PHOTOS[product.category] || CATEGORY_PHOTOS.Celulares;

  return {
    id: index + 1,
    ...product,
    photo: photos[photoIndex % photos.length],
    photoAlt: product.name,
  };
});
