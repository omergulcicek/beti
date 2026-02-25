import { slugify } from '../../utils/string';

export function processSlug(
  value: string,
  cardType?: 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown'
) {
  const finalVal = slugify(value);
  
  return { 
    value: finalVal, 
    displayValue: finalVal, 
    cursorPosition: finalVal.length, 
    cardType 
  };
}
