# beti

Seamlessly integrate smart masking and robust validation into your **react-hook-form** inputs. Get clean, unmasked values with full **TypeScript** support, built to work perfectly with **shadcn/ui**.

![npm](https://img.shields.io/npm/v/beti)
![bundlephobia](https://img.shields.io/bundlephobia/minzip/beti)
![types](https://img.shields.io/npm/types/beti)
![license](https://img.shields.io/npm/l/beti)
![npm downloads](https://img.shields.io/npm/dw/beti)

## 🚀 Live Demo

Try the interactive demo: **[omergulcicek-forms.vercel.app](https://omergulcicek-beti.vercel.app/)**

See all input types with real-time validation, masking, and shadcn/ui integration in action.

## Installation

```bash
npm install beti
```

### Peer Dependencies

This package requires the following dependencies:

```bash
npm install react react-hook-form use-mask-input
```

## Features

**Keyboard Input Validation**: Numeric fields only accept numbers  
**Smart Masking**: Automatic formatting for phone, card numbers, etc.  
**Pattern Validation**: Built-in regex validation  
**Value Access**: Get both masked and unmasked field values  
**TypeScript Support**: Full type safety  
**shadcn/ui Compatible**: Works seamlessly with shadcn/ui components  

## Usage

```tsx
import { useForm } from "react-hook-form"
import { useMaskedFormFields } from "beti"

export default function MyForm() {
  const form = useForm()

  const { cardNumber, expiryDate, cvv, tckn, phone, email, url, alpha, password, details } =
    useMaskedFormFields({
      form,
      fields: [
        // 💳 Payment Fields
        { name: "cardNumber", type: "cardNumber" },
        { name: "expiryDate", type: "expiryDate" },
        { name: "cvv", type: "cvv" },

        // 🇹🇷 Turkish Specific
        { name: "tckn", type: "tckn" },
        { name: "phone", type: "phone" },

        // 📧 Contact & Web
        { name: "email", type: "email" },
        { name: "url", type: "url" },

        // 📝 Text Fields
        { name: "alpha", type: "alpha" },
        { name: "password", type: "password" },
        { name: "details", type: "text" },
      ],
    })

  // Access field values
  console.log(cardNumber.value) // "1234567890123456" (unmasked)
  console.log(cardNumber.maskedValue) // "1234 5678 9012 3456" (masked)

  return (
    <form onSubmit={form.handleSubmit(console.log)}>
      {/* Payment */}
      <input {...cardNumber} placeholder="**** **** **** ****" />
      <input {...expiryDate} placeholder="MM/YY" />
      <input {...cvv} placeholder="***" />

      {/* Turkish */}
      <input {...tckn} placeholder="12345678950" />
      <input {...phone} placeholder="(5xx) xxx xx xx" />

      {/* Contact */}
      <input {...email} placeholder="email@example.com" />
      <input {...url} placeholder="https://example.com/" />

      {/* Text */}
      <input {...alpha} placeholder="Ömer Gülçiçek" />
      <input {...password} placeholder="••••••••" />
      <input {...details} placeholder="Additional details..." />

      <button type="submit">Submit</button>
    </form>
  )
}
```

## 💡 Value Access

Each field object provides both masked and unmasked values:

```tsx
const { cardNumber, phone } = useMaskedFormFields({
  form,
  fields: [
    { name: "cardNumber", type: "cardNumber" },
    { name: "phone", type: "phone" },
  ],
})

// Unmasked values (clean)
console.log(cardNumber.value)  // "1234567890123456"
console.log(phone.value)       // "5551234567"

// Masked values (formatted)
console.log(cardNumber.maskedValue)  // "1234 5678 9012 3456"
console.log(phone.maskedValue)       // "(555) 123 45 67"

// Use in JSX
<div>
  <span>Clean: {cardNumber.value}</span>
  <span>Formatted: {cardNumber.maskedValue}</span>
</div>
```

## 🎭 Custom Mask & Pattern

You can override the built-in masks and regex patterns per field using `mask` and `pattern` on each field config.

### Custom mask for numeric fields

```tsx
import { useForm } from "react-hook-form"
import { useMaskedFormFields } from "beti"

type FormValues = {
  altCard: string
  trPhone: string
}

const form = useForm<FormValues>()

const { altCard, trPhone } = useMaskedFormFields<FormValues>({
  form,
  fields: [
    {
      name: "altCard",
      type: "cardNumber",
      // default: "9999 9999 9999 9999"
      mask: "9999-9999-9999-9999",
    },
    {
      name: "trPhone",
      type: "phone",
      // default: "(999) 999 99 99"
      mask: "+90 (999) 999 99 99",
    },
  ],
})
```

### Custom pattern (regex) override

```tsx
const { trPhone } = useMaskedFormFields<FormValues>({
  form,
  fields: [
    {
      name: "trPhone",
      type: "phone",
      mask: "+90 (999) 999 99 99",
      pattern: /^\+90\s\d{3}\s\d{3}\s\d{2}\s\d{2}$/,
    },
  ],
})
```

### Fully custom text field

```tsx
type FormValues = { iban: string }

const form = useForm<FormValues>()

const { iban } = useMaskedFormFields<FormValues>({
  form,
  fields: [
    {
      name: "iban",
      type: "text",
      pattern: /^TR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}$/,
      inputMode: "text",
    },
  ],
})
```

## 🎨 shadcn/ui Integration

This package works seamlessly with [shadcn/ui](https://ui.shadcn.com) components. Here's how to use it:

### With shadcn Input Component

```tsx
import { useForm } from "react-hook-form"
import { useMaskedFormFields } from "beti"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ShadcnForm() {
  const form = useForm()

  const { cardNumber, phone, email, tckn } = useMaskedFormFields({
    form,
    fields: [
      { name: "cardNumber", type: "cardNumber" },
      { name: "phone", type: "phone" },
      { name: "email", type: "email" },
      { name: "tckn", type: "tckn" },
    ],
  })

  return (
    <form onSubmit={form.handleSubmit(console.log)} className="space-y-4">
      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input {...cardNumber} placeholder="**** **** **** ****" />
      </div>
      
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input {...phone} placeholder="(5xx) xxx xx xx" />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input {...email} placeholder="email@example.com" />
      </div>
      
      <div>
        <Label htmlFor="tckn">Turkish ID</Label>
        <Input {...tckn} placeholder="12345678950" />
      </div>

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### With shadcn Form Components (Advanced)

Use the basic example for quick setup, or go with the advanced version for full form control with validation, error handling, and accessibility via shadcn/ui form components.

```tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMaskedFormFields } from "beti"
import * as z from "zod"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  cardNumber: z.string().min(1, "Card number is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
})

export default function AdvancedShadcnForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { cardNumber, phone, email } = useMaskedFormFields({
    form,
    fields: [
      { name: "cardNumber", type: "cardNumber" },
      { name: "phone", type: "phone" },
      { name: "email", type: "email" },
    ],
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="space-y-6">
        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <FormControl>
                <Input {...field} {...cardNumber} placeholder="**** **** **** ****" />
              </FormControl>
              <FormDescription>Enter your 16-digit card number</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} {...phone} placeholder="(5xx) xxx xx xx" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} {...email} placeholder="email@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Key Benefits with shadcn/ui

**Perfect Integration**: Works seamlessly with Input, Label, and Form components  
**Automatic Styling**: Inherits shadcn's beautiful design system  
**Validation Support**: Compatible with Zod and form validation  
**Accessibility**: Maintains shadcn's accessibility features  
**TypeScript First**: Full type safety with shadcn components  

> **Note**: All input types (cardNumber, phone, email, tckn, etc.) work perfectly with shadcn/ui components.

### Contributors

- [@omergulcicek](https://github.com/omergulcicek)

