# Changelog

## [v1.4.0] - 2025-12-02

### Fixed
- Resolved type incompatibility with React Hook Form `defaultValues` that could cause form errors when using `useMaskedFormFields` by loosening the `form` parameter type to `unknown` in the exported hook signature.

## [v1.3.0] - 2025-12-02

### Fixed
- Prevent `value` prop from being spread to inputs to avoid caret and focus issues when using `use-mask-input`.
- Preserve IME input and keyboard shortcuts (copy, paste, select all, etc.) for `alpha` and numeric fields while keeping keyboard restrictions in place.

### Changed
- Expose `value` and `maskedValue` as non-enumerable getters so they remain available to consumers without interfering with DOM props.
- Document `useMaskedFormFields` as the primary hook name instead of `useFormFields` for clearer intent.

## [v1.2.1] - 2025-06-13

### Fixed
- Fix expiryDate regex pattern for better validation.

## [v1.2.0] - 2025-06-11

### Added
- **Field Value Access**: Added `value` and `maskedValue` properties to all field objects
  - `cardNumber.value` returns clean unmasked value (e.g., "1234567890123456")  
  - `cardNumber.maskedValue` returns formatted masked value (e.g., "1234 5678 9012 3456")
- Enhanced TypeScript support with proper field result typing

### Changed
- Updated React peer dependency to require 18.0.0 or higher
- Improved hook API: `form` object is now passed directly instead of `register` function
- Removed unnecessary memoization for better performance and simpler code

### Breaking Changes
- `register: form.register` parameter replaced with `form` object
- Field objects now include `value` and `maskedValue` properties

### Migration Guide
```tsx
// Before v1.2.0
const { cardNumber } = useFormFields({
  fields: [...],
  registerWithMask,
  register: form.register  // ❌ Old way
})

// v1.2.0+
const { cardNumber } = useFormFields({
  fields: [...],
  registerWithMask,
  form  // ✅ New way
})

// New value access
console.log(cardNumber.value)      // "1234567890123456"
console.log(cardNumber.maskedValue) // "1234 5678 9012 3456"
```

## [v1.1.6] - 2025-06-07

### Documentation
- Added live demo link to README (omergulcicek-forms.vercel.app)
- Updated project description for better clarity
- Enhanced README presentation with interactive demo section

## [v1.1.5] - 2025-06-06

### Fixed
- Fixed memoizedRegisterWithMask dependency array to properly include registerWithMask

### Documentation
- Minor improvements to README examples

## [v1.1.4] - 2025-06-06

### Fixed
- Mask functionality now works correctly in all scenarios

### Removed
- `shadcn` parameter from useFormFields hook (no longer needed)
- `getShadcnMaskProps` internal helper function

### Changed
- Simplified API - useFormFields now works consistently across all UI libraries

### Documentation
- Updated README to remove shadcn: true usage examples
- Simplified shadcn/ui integration examples

## [v1.1.3] - 2025-06-06

### Added
- MIT License file

### Documentation
- Minor improvements to README code previews

## [v1.1.2] - 2025-06-06

### Fixed
- TypeScript compilation error with keyof T indexing resolved
- Consistent maxLength calculation using MASKS length for all numeric fields

### Improved
- Performance optimization in useCallback dependencies
- Dynamic maxLength calculation instead of hardcoded values (tckn, cardNumber, expiryDate, cvv)

## [v1.1.1] - 2025-06-06

### Documentation
- Enhanced README with Features section highlighting key capabilities
- Added comprehensive shadcn/ui integration examples with FormField usage
- Improved usage documentation with better code examples
- Enhanced input types table with Keyboard Restriction column
- Added shadcn/ui compatibility link and detailed implementation guide

## [v1.1.0] - 2025-06-06

### Added
- Keyboard input restriction for numeric fields (tckn, cardNumber, expiryDate, cvv, phone)
- Only numeric keys are allowed for masked numeric inputs
- Navigation keys (Backspace, Delete, Tab, Arrow keys) support maintained

### Fixed
- Phone field pattern validation error resolved
- TCKN field now properly restricts letter input

### Changed
- Improved performance with stable function references
- Better code organization with helper functions

## [v1.0.0] - 2025-06-05

### Added
- Initial stable release
- `useFormFields` hook
- Support for 10 different input types
- TypeScript type definitions
- React Hook Form compatibility
- shadcn/ui compatibility

### Supported Field Types
- alpha, email, password, phone, tckn, text, cardNumber, expiryDate, cvv, url

### Dependencies
- React 18+
- React Hook Form 7+
- use-mask-input 3+
