<div align="center">
  <img src="./public/hero.jpg" alt="Vira Stack Mask" />
</div>

<br />

<div align="center">
  <a href="https://www.npmjs.com/package/@virastack/input-mask">
    <img src="https://img.shields.io/npm/v/@virastack/input-mask?style=flat-square&color=black" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@virastack/input-mask">
    <img src="https://img.shields.io/npm/dt/@virastack/input-mask?style=flat-square&color=black" alt="npm downloads" />
  </a>
  <a href="https://bundlephobia.com/package/@virastack/input-mask">
    <img src="https://img.shields.io/bundlephobia/minzip/@virastack/input-mask?style=flat-square&color=black" alt="bundle size" />
  </a>
</div>

<br />

# ViraStack Input Mask

The lightweight standard for input formatting and state synchronization in React.

- 🚀 **Ultra-lightweight:** Less than 5KB minified & zipped.
- ⚛️ **React-First:** Seamless integration with React Hook Form.
- 🛡️ **Type-Safe:** Built with TypeScript for an excellent developer experience.
- 🧠 **Smart Presets:** Built-in masks for credit cards, phones, currency, and more.

### [Read the docs →](https://virastack.com/mask)

## Quick Start

```bash
npm install @virastack/input-mask
```

```tsx
import { useForm } from 'react-hook-form';
import { useViraMask } from '@virastack/input-mask';

function App() {
  const form = useForm();
  
  const { phone } = useViraMask({
    form,
    schema: {
      phone: 'phone'
    }
  });

  return (
    <form>
      <input {...phone} placeholder="(555) 555 55 55" />
    </form>
  );
}
```

## Explore the ViraStack Ecosystem

- [**AI Rules**](https://github.com/virastack/ai-rules) – Standardized AI rules for consistent code generation
- [**Next.js Boilerplate**](https://github.com/virastack/nextjs-boilerplate) – Full-featured, scalable Next.js starter kit
- [**Input Mask**](https://github.com/virastack/input-mask) – Lightweight, zero-dependency input masking library
- [**Password Toggle**](https://github.com/virastack/password-toggle) – Accessible, headless password visibility component

... and more at [**virastack.com**](https://virastack.com)

---

<div align="center">
  <p>Built with precision by <a href="https://omergulcicek.com"><b>Ömer Gülçiçek</b></a></p>
  <p>
    <a href="https://github.com/omergulcicek">
      <img src="https://img.shields.io/github/followers/omergulcicek?label=Follow&style=social" alt="Follow Ömer Gülçiçek" />
    </a>
  </p>
</div>