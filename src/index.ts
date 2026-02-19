// © 2025 Ömer Gülçiçek – MIT License
// https://omergulcicek.com • https://github.com/omergulcicek

import { useHookFormMask } from "use-mask-input";

type FieldValues = Record<string, unknown>;

const MASKS = {
  tckn: "99999999999",
  cardNumber: "9999 9999 9999 9999",
  expiryDate: "99/99",
  cvv: "999",
  phone: "(999) 999 99 99",
} as const;

const REGEX = {
  alpha: /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\d{10}$/,
  tckn: /^\d{11}$/,
  cardNumber: /^\d{4} \d{4} \d{4} \d{4}$/,
  expiryDate: /^\d{2}\/\d{2}$/,
  cvv: /^\d{3}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i,
};

const NUMERIC_FIELD_CONFIGS = {
  tckn: { maxLength: MASKS.tckn.length, pattern: REGEX.tckn.source },
  cardNumber: {
    maxLength: MASKS.cardNumber.length,
    pattern: REGEX.cardNumber.source,
  },
  expiryDate: {
    maxLength: MASKS.expiryDate.length,
    pattern: REGEX.expiryDate.source,
  },
  cvv: { maxLength: MASKS.cvv.length, pattern: REGEX.cvv.source },
  phone: { maxLength: MASKS.phone.length },
} as const;

const TEXT_FIELD_CONFIGS = {
  email: { type: "email" as const, pattern: REGEX.email.source },
  password: { type: "password" as const },
  url: { type: "url" as const, pattern: REGEX.url.source },
} as const;

const COMMON_NUMERIC_PROPS = {
  type: "text" as const,
  inputMode: "numeric" as const,
};

const NAVIGATION_KEYS = [
  "Backspace",
  "Delete",
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
];

const MASK_OPTIONS = {
  showMaskOnFocus: false,
  showMaskOnHover: false,
  autoUnmask: true,
  placeholder: "",
} as const;

const INPUT_TYPE_TEXT = "text" as const;

type FieldType =
  | keyof typeof NUMERIC_FIELD_CONFIGS
  | keyof typeof TEXT_FIELD_CONFIGS
  | "alpha"
  | "text";

interface FieldKeyDownEvent {
  key: string;
  preventDefault: () => void;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  isComposing?: boolean;
}

interface FieldResult {
  value: string;
  maskedValue: string;
  [key: string]: unknown;
}

type FieldName<TFieldValues extends FieldValues> = Extract<
  keyof TFieldValues,
  string
>;

interface FieldConfig<TFieldName extends string> {
  name: TFieldName;
  type: FieldType;
  mask?: string;
  pattern?: RegExp | string;
  inputMode?: string;
  onKeyDown?: (event: FieldKeyDownEvent) => void;
}

interface FormAdapter<TFieldValues extends FieldValues> {
  register: (name: FieldName<TFieldValues>) => Record<string, unknown>;
  watch: (name: FieldName<TFieldValues>) => unknown;
}

interface UseFormFieldsParams<TFieldValues extends FieldValues> {
  fields: Array<FieldConfig<FieldName<TFieldValues>>>;
  registerWithMask: (
    name: FieldName<TFieldValues>,
    mask: string,
    options?: Record<string, unknown>
  ) => Record<string, unknown>;
  form: FormAdapter<TFieldValues>;
}

const handleAlphaKeyDown = (e: { key: string; preventDefault: () => void }) => {
  if ("isComposing" in e && e.isComposing) return;

  if (
    ("metaKey" in e && e.metaKey) ||
    ("ctrlKey" in e && e.ctrlKey) ||
    ("altKey" in e && e.altKey)
  ) {
    return;
  }

  if (!REGEX.alpha.test(e.key) && !NAVIGATION_KEYS.includes(e.key)) {
    e.preventDefault();
  }
};

const handleAlphaPaste = (e: {
  preventDefault: () => void;
  clipboardData: { getData: (type: string) => string };
}) => {
  const pastedText = e.clipboardData.getData("text");

  if (!REGEX.alpha.test(pastedText)) {
    e.preventDefault();
  }
};

const handleNumericKeyDown = (e: FieldKeyDownEvent) => {
  if (e.isComposing) return;

  if (e.metaKey || e.ctrlKey || e.altKey) {
    return;
  }

  if (!/\d/.test(e.key) && !NAVIGATION_KEYS.includes(e.key)) {
    e.preventDefault();
  }
};

const isNumericField = (
  type: FieldType
): type is keyof typeof NUMERIC_FIELD_CONFIGS => type in NUMERIC_FIELD_CONFIGS;

const isCommonTextField = (
  type: FieldType
): type is keyof typeof TEXT_FIELD_CONFIGS => type in TEXT_FIELD_CONFIGS;

const getNumericFieldProps = (
  type: keyof typeof NUMERIC_FIELD_CONFIGS,
  overrides?: {
    inputMode?: string;
    pattern?: string;
    onKeyDown?: (event: { key: string; preventDefault: () => void }) => void;
  }
) => ({
  ...COMMON_NUMERIC_PROPS,
  ...NUMERIC_FIELD_CONFIGS[type],
  ...(overrides?.pattern ? { pattern: overrides.pattern } : {}),
  ...(overrides?.inputMode ? { inputMode: overrides.inputMode } : {}),
  onKeyDown: overrides?.onKeyDown ?? handleNumericKeyDown,
});

/**
 * Creates form field props with mask and validation
 * @param fields - Array of field configurations
 * @param registerWithMask - React Hook Form mask register function
 * @param form - React Hook Form instance
 * @returns Object with field names as keys and props as values
 */
export function useFormFields<TFieldValues extends FieldValues>({
  fields,
  registerWithMask,
  form,
}: UseFormFieldsParams<TFieldValues>): Record<string, FieldResult> {
  const result: Record<string, FieldResult> = {};

  fields.forEach((fieldConfig) => {
    const {
      name,
      type,
      mask: customMask,
      pattern,
      inputMode,
      onKeyDown,
    } = fieldConfig;

    const baseRegisterProps = form.register(name);

    const patternSource =
      typeof pattern === "string"
        ? pattern
        : pattern instanceof RegExp
        ? pattern.source
        : undefined;

    const getCleanValue = (value: string) => {
      if (isNumericField(type)) {
        return value.replace(/\D/g, "");
      }
      return value;
    };

    const getMaskedValue = (value: string): string => {
      if (!isNumericField(type) || !MASKS[type]) return value;

      const cleanValue = getCleanValue(value);
      const mask = customMask ?? MASKS[type];
      let valueIndex = 0;

      return [...mask].reduce((acc, char) => {
        if (valueIndex >= cleanValue.length) return acc;
        if (char === "9") {
          acc += cleanValue[valueIndex];
          valueIndex++;
        } else {
          acc += char;
        }
        return acc;
      }, "");
    };

    const attachValueProps = (target: Record<string, unknown>): FieldResult => {
      const fieldResult = target as FieldResult;

      Object.defineProperty(fieldResult, "value", {
        get: () => getCleanValue(String(form.watch(name) || "")),
        enumerable: false,
      });

      Object.defineProperty(fieldResult, "maskedValue", {
        get: () => getMaskedValue(String(form.watch(name) || "")),
        enumerable: false,
      });

      return fieldResult;
    };

    if (isNumericField(type)) {
      const mask = customMask ?? MASKS[type];

      const maskProps = registerWithMask(name, mask, MASK_OPTIONS);

      result[String(name)] = attachValueProps({
        ...maskProps,
        ...getNumericFieldProps(type, {
          inputMode,
          pattern: patternSource,
          onKeyDown,
        }),
      });
    } else if (type === "alpha") {
      result[String(name)] = attachValueProps({
        ...baseRegisterProps,
        type: INPUT_TYPE_TEXT,
        pattern: patternSource ?? REGEX.alpha.source,
        onPaste: handleAlphaPaste,
        onKeyDown: onKeyDown ?? handleAlphaKeyDown,
      });
    } else if (isCommonTextField(type)) {
      result[String(name)] = attachValueProps({
        ...baseRegisterProps,
        ...TEXT_FIELD_CONFIGS[type],
        ...(patternSource ? { pattern: patternSource } : {}),
        ...(inputMode ? { inputMode } : {}),
        ...(onKeyDown ? { onKeyDown } : {}),
      });
    } else {
      result[String(name)] = attachValueProps({
        ...baseRegisterProps,
        type: INPUT_TYPE_TEXT,
        ...(patternSource ? { pattern: patternSource } : {}),
        ...(inputMode ? { inputMode } : {}),
        ...(onKeyDown ? { onKeyDown } : {}),
      });
    }
  });

  return result;
}

interface UseMaskedFormFieldsParams<TFieldValues extends FieldValues> {
  form: unknown;
  fields: UseFormFieldsParams<TFieldValues>["fields"];
}

export function useMaskedFormFields<TFieldValues extends FieldValues>({
  form,
  fields,
}: UseMaskedFormFieldsParams<TFieldValues>): Record<string, FieldResult> {
  const typedForm = form as FormAdapter<FieldValues>;

  const registerWithMask = useHookFormMask<FieldValues>(
    typedForm.register as (name: string) => Record<string, unknown>
  );

  return useFormFields<TFieldValues>({
    form: typedForm as FormAdapter<TFieldValues>,
    fields,
    registerWithMask,
  });
}

export type {
  FieldType,
  FieldResult,
  FieldConfig,
  UseFormFieldsParams,
  UseMaskedFormFieldsParams,
};
