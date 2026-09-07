function usd(amount) {
  const value = Number(amount ?? 0);
  const hasCents = !Number.isInteger(value);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function displayedMonthlyRate(plan) {
  const total = Number(plan?.price ?? 0);
  const monthlyRate = plan?.duration === 'annual' ? total / 12 : total;

  return usd(monthlyRate);
}

export function annualBillingNote(plan) {
  return `Billed ${usd(plan?.price)} annually. Save ${Number(plan?.annualSavingsPercent ?? 0)}%`;
}
