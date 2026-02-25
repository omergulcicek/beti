import { BetiOptions } from '../types';
import { slugify, cleanValue as cleanValueUtil } from '../utils/string';
import { processCurrency, formatCurrency as formatCurrencyStrategy, unformatCurrency as unformatCurrencyStrategy } from './strategies/currency';
import { processMask, applyMask as applyMaskStrategy, unmask as unmaskStrategy, stripMask as stripMaskStrategy } from './strategies/mask';
import { processSlug } from './strategies/slug';
import { processDefault } from './strategies/default';
import { getCardType as getCardTypeStrategy } from './strategies/card';

export const toSlug = slugify;
export const cleanValue = cleanValueUtil;
export const applyMask = applyMaskStrategy;
export const unmask = unmaskStrategy;
export const stripMask = stripMaskStrategy;
export const formatCurrency = formatCurrencyStrategy;
export const unformatCurrency = unformatCurrencyStrategy;
export const getCardType = getCardTypeStrategy;

export function processInput(
  value: string, 
  options: BetiOptions, 
  selectionStart: number | null = null,
  previousValue: string = ''
): { value: string; displayValue: string; cursorPosition: number; cardType?: 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown' } {
  
  let cardType: 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown' | undefined;

  if (options.onCardTypeChange) {
      cardType = getCardType(value);
  }

  if (options.usernameFormat) {
    return processSlug(value, cardType);
  }

  if (options.currency) {
    return processCurrency(value, options.currency, selectionStart, cardType);
  }
  
  if (options.mask) {
    return processMask(value, options, selectionStart, previousValue, cardType);
  }
  
  return processDefault(value, options, selectionStart, cardType);
}
