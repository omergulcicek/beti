import { BetiOptions } from '../../types';
import { cleanValue } from '../../utils/string';

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

export function processMask(
  value: string,
  options: BetiOptions,
  selectionStart: number | null,
  previousValue: string,
  cardType?: 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown'
) {
  const { mask, allowedChars, forbiddenChars, transform, displayPrefix } = options;
  if (!mask) throw new Error("Mask is required for processMask");

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
