<div align="center">
  <img src="./public/beti.svg" alt="Beti" width="160" />
</div>

# Beti

**A lightweight, zero-dependency masking library for React Hook Form.**

Beti is a high-performance, ultra-lightweight (<5KB) masking library designed for modern React applications. It provides a seamless way to handle complex input masking while keeping your form state clean and your UI butter-smooth.

![npm](https://img.shields.io/npm/v/beti)
![bundlephobia](https://img.shields.io/bundlephobia/minzip/beti)
![types](https://img.shields.io/npm/types/beti)
![license](https://img.shields.io/npm/l/beti)
![npm downloads](https://img.shields.io/npm/dw/beti)

## 🚀 Live Demo & Documentation

For interactive demos, full API reference, and advanced usage examples, visit:

👉 **[beti.omergulcicek.com](https://beti.omergulcicek.com)**

---

## ✨ Why Beti?

Most masking libraries are heavy, manipulate the DOM directly, or mess up the cursor position. Beti was built to solve these with a "React-First" mindset.

* **🪶 Zero Dependencies:** No `inputmask`, no `jquery`. Pure, optimized logic.
* **🧹 Clean State Philosophy:** Stores the raw, unmasked value in your state, but displays the masked version in the UI.
* **⚛️ React 19 & Next.js Ready:** Built with `'use client'` and compatible with Server Components and the latest React 19 ref patterns.
* **🎯 Cursor Intelligence:** Advanced cursor position management prevents "jumping" when editing in the middle of a value.
* **🚀 Ultra Fast:** Optimized with `useMemo` and `requestAnimationFrame` for a zero-lag experience.
* **🛡️ Built-in Validation:** Includes algorithmic validators for Credit Cards (Luhn), TCKN, IBAN, and more.
* **💳 Smart Detection:** Auto-detects credit card types (Visa, Mastercard, Amex, Troy) and formats accordingly.

## 🚀 Installation

```bash
npm install beti
```

## 🛠️ Quick Start

Beti uses a Schema-based approach to keep your JSX clean. Define your masks once, and spread them into your inputs.

```tsx
import { useBeti } from 'beti';
import { useForm } from 'react-hook-form';

const MyForm = () => {
  const form = useForm();
  
  const fields = useBeti({
    form,
    schema: {
      phone: 'phone',
      // Add more fields here...
    }
  });

  return (
    <form>
      <input {...fields.phone} />
    </form>
  );
};
```

## 📦 Features & Presets

Beti comes with a rich set of presets and configuration options. 

* **Presets:** `card`, `phone`, `currency`, `iban`, `tckn`, `date`, `time`, `numeric`, `alpha`, `email`, `url`, `username`, `taxNumber`, `zipCode`...
* **Advanced Options:**
    * `displayPrefix` (e.g., fixed "TR" for IBAN)
    * `onCardTypeChange` (Detect Visa/Mastercard/Troy/Amex)
    * `currency` (Symbol, precision, separators)
    * `transform` (Uppercase/Lowercase)
    * `allowedChars` / `forbiddenChars` (Regex based filtering)
    * `validate` (Built-in algorithmic validation)

For the full list of features and customization options, please check the **[official documentation](https://beti.omergulcicek.com)**.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Built with ❤️ by [Ömer Gülçiçek](https://omergulcicek.com)
