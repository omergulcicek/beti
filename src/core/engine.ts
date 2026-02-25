import { BetiOptions, CurrencyOptions } from '../types';

export function toSlug(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function cleanValue(value: string, allowedChars?: RegExp, forbiddenChars?: RegExp): string {
  let cleaned = value;
  if (forbiddenChars) {
    cleaned = cleaned.replace(forbiddenChars, '');
  }
  if (allowedChars) {
    cleaned = cleaned.split('').filter(c => allowedChars.test(c)).join('');
  }
  return cleaned;
}

export function applyMask(value: string, mask: string): string {
  let valueIndex = 0;
  let result = '';
  
  for (let i = 0; i < mask.length; i++) {
    const maskChar = mask[i];
    
    if (valueIndex >= value.length) break;
    
    if (maskChar === '9') {
      if (/[0-9]/.test(value[valueIndex])) {
        result += value[valueIndex];
        valueIndex++;
      } else {
        valueIndex++; 
        i--; 
        continue;
      }
    } else if (maskChar === 'a' || maskChar === 'A') {
      if (/[a-zA-Z]/.test(value[valueIndex])) {
        result += value[valueIndex];
        valueIndex++;
      } else {
        valueIndex++;
        i--;
        continue;
      }
    } else if (maskChar === '*') {
      result += value[valueIndex];
      valueIndex++;
    } else {
      result += maskChar;
      if (value[valueIndex] === maskChar) {
        valueIndex++;
      }
    }
  }
  
  return result;
}

export function unmask(value: string, mask: string): string {
  let effectiveAllowed;
  if (mask.includes('9')) effectiveAllowed = /[0-9]/;
  else if (mask.includes('a')) effectiveAllowed = /[a-zA-Z]/;
  else effectiveAllowed = /[a-zA-Z0-9]/;
  
  return cleanValue(value, effectiveAllowed);
}

export function stripMask(value: string, mask: string): string {
  let result = '';
  let valueIndex = 0;
  
  for (let i = 0; i < mask.length; i++) {
    if (valueIndex >= value.length) break;
    
    const maskChar = mask[i];
    const valueChar = value[valueIndex];
    
    if (maskChar === '9' || maskChar === 'a' || maskChar === '*') {
      result += valueChar;
      valueIndex++;
    } else {
      if (valueChar === maskChar) {
        valueIndex++;
      }
    }
  }
  return result;
}

export function formatCurrency(value: string, options: CurrencyOptions): string {
  const {
    precision = 2,
    decimalSeparator = ',',
    thousandSeparator = '.',
    symbol = '',
    symbolPosition = 'prefix',
  } = options;

  let numeric = value.replace(/[^0-9]/g, '');
  
  if (numeric === '') return '';
  
  while (numeric.length <= precision) {
    numeric = '0' + numeric;
  }
  
  const integerPart = numeric.slice(0, numeric.length - precision);
  const decimalPart = numeric.slice(numeric.length - precision);
  
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  
  let result = `${formattedInteger}${decimalSeparator}${decimalPart}`;
  
  if (symbol) {
    result = symbolPosition === 'prefix' ? `${symbol}${result}` : `${result}${symbol}`;
  }
  
  return result;
}

export function unformatCurrency(value: string, options: CurrencyOptions): string {
   const { decimalSeparator = ',' } = options;
   const regex = new RegExp(`[^0-9${decimalSeparator}]`, 'g');
   let clean = value.replace(regex, '');
   
   clean = clean.replace(decimalSeparator, '.');
   
   return clean;
}

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

export function processInput(
  value: string, 
  options: BetiOptions, 
  selectionStart: number | null = null,
  previousValue: string = ''
): { value: string; displayValue: string; cursorPosition: number; cardType?: 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown' } {
  
  const { mask, currency, transform, allowedChars, forbiddenChars, alphaFormat, usernameFormat, displayPrefix } = options;
  
  let processed = value;
  let cardType: 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown' | undefined;

  if (options.onCardTypeChange) {
      cardType = getCardType(value);
  }

  if (usernameFormat) {
    let raw = value;
    
    let converted = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    converted = converted.replace(/\s+/g, "-");
    
    converted = converted.replace(/[^a-z0-9-]/g, "");
    
    converted = converted.replace(/-+/g, "-");
    
    converted = converted.replace(/^-/, "");
    
    const finalVal = converted;
    
    return { value: finalVal, displayValue: finalVal, cursorPosition: finalVal.length, cardType };
  }

  if (currency) {
    const raw = processed.replace(/[^0-9]/g, '');
    let finalDisplayValue = '';
    let finalRawValue = '';
    
    if (!raw) {
      finalDisplayValue = '';
      finalRawValue = '';
    } else {
      const precision = currency.precision ?? 2;
      const integerPart = (raw.length > precision ? raw.slice(0, raw.length - precision) : '0').replace(/^0+(?=\d)/, '');
      const decimalPart = raw.slice(-precision).padStart(precision, '0');
      finalRawValue = integerPart + '.' + decimalPart;
      finalDisplayValue = formatCurrency(finalRawValue, currency);
    }
    
    return { 
      value: finalRawValue, 
      displayValue: finalDisplayValue, 
      cursorPosition: finalDisplayValue.length,
      cardType
    };
  }
  
  if (mask) {
    let effectiveAllowed = allowedChars;
    if (!effectiveAllowed) {
        if (mask.includes('9')) effectiveAllowed = /[0-9]/;
        else if (mask.includes('a')) effectiveAllowed = /[a-zA-Z]/;
        else effectiveAllowed = /[a-zA-Z0-9]/;
    }
    
    let dataCharsBeforeCursor = 0;
    if (selectionStart !== null) {
        const beforeCursor = value.slice(0, selectionStart);
        const cleanBefore = cleanValue(beforeCursor, effectiveAllowed, forbiddenChars);
        dataCharsBeforeCursor = cleanBefore.length;
    }
    
    const raw = cleanValue(value, effectiveAllowed, forbiddenChars);
    
    let processedRaw = raw;
    if (transform === 'uppercase') processedRaw = processedRaw.toUpperCase();
    if (transform === 'lowercase') processedRaw = processedRaw.toLowerCase();

    if (selectionStart !== null && previousValue) {
        const isDeletion = value.length < previousValue.length;
        if (isDeletion) {
             const cleanPrev = cleanValue(previousValue, effectiveAllowed, forbiddenChars);
             if (cleanPrev === processedRaw) {
                 if (dataCharsBeforeCursor > 0) {
                     processedRaw = processedRaw.slice(0, dataCharsBeforeCursor - 1) + processedRaw.slice(dataCharsBeforeCursor);
                     dataCharsBeforeCursor--; 
                 }
             }
        }
    }

    const maskedPart = applyMask(processedRaw, mask);
    const displayValue = displayPrefix ? displayPrefix + maskedPart : maskedPart;
    const finalRawValue = displayPrefix ? stripMask(maskedPart, mask) : stripMask(displayValue, mask);
    
    let cursorPosition = 0;
    const prefixLen = displayPrefix?.length ?? 0;
    
    if (selectionStart !== null) {
        let matchesFound = 0;
        for (let i = 0; i < maskedPart.length; i++) {
             const maskChar = mask[i];
             const isDataSlot = maskChar === '9' || maskChar === 'a' || maskChar === '*';
             
             if (isDataSlot) {
                 matchesFound++;
                 if (matchesFound <= dataCharsBeforeCursor) {
                     cursorPosition = prefixLen + i + 1;
                 }
             } else {
                 if (matchesFound === dataCharsBeforeCursor) {
                     cursorPosition = prefixLen + i + 1;
                 }
             }
             
             if (matchesFound > dataCharsBeforeCursor) break;
        }
    } else {
        cursorPosition = displayValue.length;
    }

    return { value: finalRawValue, displayValue, cursorPosition, cardType };
  }
  
  let rawValue = cleanValue(processed, allowedChars, forbiddenChars);
  
  if (alphaFormat) {
    rawValue = rawValue
      .replace(/\s+/g, ' ');
    let displayRaw = rawValue;
    if (transform === 'uppercase') displayRaw = displayRaw.toUpperCase();
    if (transform === 'lowercase') displayRaw = displayRaw.toLowerCase();
    
    const trimmedRaw = rawValue.trim();
    
    const cursorPosition = Math.min(
      selectionStart ?? displayRaw.length,
      displayRaw.length
    );
    return { value: trimmedRaw, displayValue: displayRaw, cursorPosition, cardType };
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
