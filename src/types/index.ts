import { ChangeEvent, FocusEvent, RefCallback, HTMLInputTypeAttribute } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

export type BetiPreset =
  | 'card'
  | 'expiry'
  | 'cvv'
  | 'tckn'
  | 'phone'
  | 'email'
  | 'url'
  | 'username'
  | 'alpha'
  | 'password'
  | 'text'
  | 'currency'
  | 'iban'
  | 'numeric'
  | 'date'
  | 'taxNumber'
  | 'zipCode';

export interface CurrencyOptions {
  precision?: number;
  decimalSeparator?: string;
  thousandSeparator?: string;
  symbol?: string;
  symbolPosition?: 'prefix' | 'suffix';
}

export interface BetiOptions {
  mask?: string;
  transform?: 'uppercase' | 'lowercase';
  allowedChars?: RegExp;
  forbiddenChars?: RegExp;
  currency?: CurrencyOptions;
  placeholderChar?: string;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  type?: HTMLInputTypeAttribute;
  validate?: boolean;
  validator?: ((value: string) => boolean) | 'luhn' | 'tckn' | 'email' | 'iban' | 'expiry' | 'date' | 'url' | 'vkn';
  autoComplete?: string;
  /** Custom error message for validation failure */
  errorMessage?: string;
  /** Date format for validation (default: 'DMY') */
  dateFormat?: 'DMY' | 'MDY' | 'YMD';
  /** When true, allows Turkish chars, single space between words, trims raw value */
  alphaFormat?: boolean;
  /** When true, converts input to URL slug (e.g. "Ömer Gülçiçek" -> "omer-gulcicek") */
  usernameFormat?: boolean;
  /** Prefix shown in display but not stored in raw value (e.g. 'TR' for IBAN) */
  displayPrefix?: string;
  /** Base preset to extend from */
  preset?: BetiPreset;
  /** Returns the detected card type (only for 'card' preset) */
  onCardTypeChange?: (type: 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown') => void;
}

export interface BetiPresetConfig extends BetiOptions {
  type: BetiPreset;
}

export type BetiSchema<TFieldValues extends FieldValues> = {
  [K in keyof TFieldValues]?: BetiPreset | BetiOptions;
};

export interface BetiField {
  ref: RefCallback<HTMLInputElement>;
  name: string;
  value: string;
  rawValue: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
  onFocus: (e: FocusEvent<HTMLInputElement>) => void;
  type?: HTMLInputTypeAttribute;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  autoComplete?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  title?: string;
}

export type BetiFields<TSchema> = {
  [K in keyof TSchema]: BetiField;
};

export interface UseBetiProps<TFieldValues extends FieldValues, TSchema extends BetiSchema<TFieldValues>> {
  form: UseFormReturn<TFieldValues>;
  schema: TSchema;
}
