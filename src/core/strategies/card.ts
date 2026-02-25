export function getCardType(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown' {
  const clean = cardNumber.replace(/\D/g, '');
  
  if (clean.startsWith('4')) return 'visa';
  
  const mastercardRegex = /^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[0-1]\d|2720)/;
  if (mastercardRegex.test(clean)) {
    return 'mastercard';
  }
  
  if (clean.startsWith('34') || clean.startsWith('37')) return 'amex';
  if (clean.startsWith('9792')) return 'troy';
  
  return 'unknown';
}
