# Changelog

## [v1.0.0-beta.1] - 2026-02-24

### Improvements

- **Enhanced Card Validation**: `validateLuhn` now includes strict length checks based on card type.
  - **Amex**: Must be 15 digits (starts with 34/37).
  - **Others (Visa, Mastercard, etc.)**: Must be 16 digits.
  - This prevents mathematically valid but structurally invalid card numbers (e.g. 15-digit Visa numbers) from passing validation.

## [v1.0.0] - 2026-02-24

### Major Changes

- **Initial Release**: `beti` is now live! This package is a complete rewrite and spiritual successor to previous form masking solutions.
- **Architecture**: Zero-dependency, custom masking engine built for performance and reliability.
- **Hook**: `useBeti` provides a simple, type-safe API for React Hook Form.

### Features

- **Full Type Support**: Enhanced TypeScript definitions for better developer experience.
- **Validation**: Built-in algorithmic validation for Credit Cards (Luhn) and Turkish Identity Number (TCKN).
- **Card Type Detection**: Added `onCardTypeChange` callback to detect card issuer (Visa, Mastercard, Amex, Troy).
- **Dynamic CVV**: CVV field now automatically adjusts length (3 or 4 digits) based on the entered card number.
- **Dynamic Masking**: Support for Amex cards (auto-switches to 4-6-5 format).
- **Presets**: Includes `card`, `expiry`, `cvv`, `tckn`, `phone`, `email`, `url`, `username`, `iban`, `taxNumber`, `zipCode`, `date`, `numeric`, and `currency`.
- **UX Improvements**: 
  - Enhanced cursor stability during typing.
  - Improved backspace handling for currency fields with suffixes.
- **Customization**: Options for `allowedChars`, `forbiddenChars`, `transform`, and detailed currency configuration.
