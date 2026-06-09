import { STORE } from '../data/siteData';

export function createWhatsAppLink(message, phone) {
  const normalizedPhone = (phone ?? STORE.phone).replace(/\D/g, '');
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function cartMessage(items, total) {
  const lines = items.map(
    (item) => `- ${item.quantity}x ${item.name} (${item.price})`
  );

  return `Olá, gostaria de finalizar meu pedido:\n\n${lines.join('\n')}\n\nTotal: ${typeof total === 'number' ? total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : total}`;
}

export function productMessage(productName) {
  return `Olá, tenho interesse no produto ${productName}. Ainda está disponível?`;
}

export function offerMessage(offerName) {
  return `Olá, tenho interesse na oferta ${offerName}. Ainda está disponível?`;
}

export function deliveryMessage(itemName, type = 'produto') {
  return `Olá, tenho interesse no ${type} ${itemName} e gostaria de saber sobre a entrega.`;
}

export function serviceMessage(serviceName) {
  return `Olá, preciso de ajuda com ${serviceName}. Pode me atender?`;
}

export const generalMessage =
  'Olá, vim pelo site e gostaria de ver os produtos disponíveis.';
