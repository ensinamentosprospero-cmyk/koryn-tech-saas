export function parsePrice(priceLabel) {
  if (typeof priceLabel === 'number') return priceLabel;

  const normalized = String(priceLabel)
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatInstallmentValue(value) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function buildCreditInstallments(total) {
  const plans = [];
  const monthlyRate = 0.0162;

  for (let installments = 1; installments <= 12; installments += 1) {
    if (installments === 1) {
      plans.push({
        installments,
        installmentValue: total,
        total,
        suffix: 'à vista',
        hasInterest: false,
      });
      continue;
    }

    if (installments <= 10) {
      const installmentValue = total / installments;
      plans.push({
        installments,
        installmentValue,
        total,
        suffix: 'sem juros',
        hasInterest: false,
      });
      continue;
    }

    const factor =
      (monthlyRate * (1 + monthlyRate) ** installments) /
      ((1 + monthlyRate) ** installments - 1);
    const installmentValue = total * factor;
    const totalWithInterest = installmentValue * installments;

    plans.push({
      installments,
      installmentValue,
      total: totalWithInterest,
      suffix: `com juros (${(monthlyRate * 100).toFixed(2)}% a.m.)`,
      hasInterest: true,
    });
  }

  return plans;
}
