import { MaskOptions } from '../../types';
import { cleanValue } from '../../utils/string';

export function processDefault(
  value: string,
  options: MaskOptions,
  selectionStart: number | null,
  cardType?: 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown'
) {
  const { allowedChars, forbiddenChars, alphaFormat, transform } = options;

  let rawValue = cleanValue(value, allowedChars, forbiddenChars);
  
  if (alphaFormat) {
    rawValue = rawValue.replace(/\s+/g, ' ');
    let displayRaw = rawValue;
    if (transform === 'uppercase') displayRaw = displayRaw.toUpperCase();
    if (transform === 'lowercase') displayRaw = displayRaw.toLowerCase();
    
    const cursorPosition = Math.min(
      selectionStart ?? displayRaw.length,
      displayRaw.length
    );
    return { value: rawValue, displayValue: displayRaw, cursorPosition, cardType };
  }
  
  let finalDisplay = rawValue;
  if (transform === 'uppercase') finalDisplay = finalDisplay.toUpperCase();
  if (transform === 'lowercase') finalDisplay = finalDisplay.toLowerCase();
  
  let cursorPosition = finalDisplay.length;
  if (selectionStart !== null && selectionStart < finalDisplay.length) {
      cursorPosition = selectionStart;
  }

  return { value: rawValue, displayValue: finalDisplay, cursorPosition, cardType };
}
