'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FieldValues, Path, PathValue } from 'react-hook-form';
import { processInput } from '../core/engine';
import { VALIDATORS } from '../core/logic';
import { PRESETS } from '../core/presets';
import { BetiField, BetiFields, BetiOptions, BetiPreset, BetiSchema, UseBetiProps } from '../types';
import { mergeRefs } from '../utils/ref';

export function useBeti<
  TFieldValues extends FieldValues,
  TSchema extends BetiSchema<TFieldValues>
>({
  form,
  schema,
}: UseBetiProps<TFieldValues, TSchema>) {
  const { setValue, getValues, register, formState: { errors } } = form;
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const cursorRequestRef = useRef<{ name: string; position: number } | null>(null);
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const isComposingRef = useRef(false);

  useLayoutEffect(() => {
    if (cursorRequestRef.current) {
      const { name, position } = cursorRequestRef.current;
      const input = fieldRefs.current[name];
      if (input) {
        input.setSelectionRange(position, position);
      }
      cursorRequestRef.current = null;
    }
  });

  const getMaskOptions = useCallback((config: BetiPreset | BetiOptions): BetiOptions => {
    if (typeof config === 'string') {
      return PRESETS[config] || {};
    }
    if (config.preset) {
      return { ...PRESETS[config.preset], ...config };
    }
    return config;
  }, []);

  const getEffectiveOptions = useCallback((options: BetiOptions, value: string): BetiOptions => {
    if (options.resolveMask) {
      const currentValues = getValues();
      const resolvedMask = options.resolveMask(value, currentValues, schema);
      if (resolvedMask) {
        return { ...options, mask: resolvedMask };
      }
    }
    return options;
  }, [getValues, schema]);

  // Sync input values with RHF values (Lazy Initialization & External Updates)
  useLayoutEffect(() => {
    for (const key in schema) {
      const input = fieldRefs.current[key];
      if (!input) continue;

      const config = schema[key];
      if (!config) continue;

      const fieldName = key as unknown as Path<TFieldValues>;
      const formValue = getValues(fieldName);

      if (formValue !== undefined && formValue !== null) {
        const stringValue = String(formValue);
        const options = getMaskOptions(config);
        const effectiveOptions = getEffectiveOptions(options, stringValue);
        const { displayValue } = processInput(stringValue, effectiveOptions);

        if (input.value !== displayValue) {
          input.value = displayValue;
        }
      }
    }
  });

  const updateField = useCallback((
    name: Path<TFieldValues>,
    value: string,
    options: BetiOptions,
    selectionStart: number | null,
    inputElement: HTMLInputElement
  ) => {
    let previousDisplayValue = '';
    const currentRawValue = getValues(name);
    if (currentRawValue !== undefined && currentRawValue !== null) {
       const oldEffectiveOptions = getEffectiveOptions(options, String(currentRawValue));
       const { displayValue } = processInput(String(currentRawValue), oldEffectiveOptions);
       previousDisplayValue = displayValue;
    }

    const effectiveOptions = getEffectiveOptions(options, value);
    const { value: finalRawValue, displayValue: finalDisplayValue, cursorPosition, cardType } = processInput(
        value, 
        effectiveOptions, 
        selectionStart,
        previousDisplayValue
    );

    if (cardType && options.onCardTypeChange) {
        options.onCardTypeChange(cardType);
    }

    inputElement.value = finalDisplayValue;
    
    setValue(name, finalRawValue as PathValue<TFieldValues, Path<TFieldValues>>, { 
        shouldValidate: true, 
        shouldDirty: true, 
        shouldTouch: true 
    });

    cursorRequestRef.current = { name, position: cursorPosition };
  }, [setValue, getValues, getEffectiveOptions]);

  const createChangeHandler = useCallback(
    (name: Path<TFieldValues>, options: BetiOptions) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isComposingRef.current) return;
        updateField(name, e.target.value, options, e.target.selectionStart, e.target);
      };
    },
    [updateField]
  );

  const createCompositionStartHandler = useCallback(() => {
    return () => {
      isComposingRef.current = true;
    };
  }, []);

  const createCompositionEndHandler = useCallback(
    (name: Path<TFieldValues>, options: BetiOptions) => {
      return (e: React.CompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = false;
        updateField(name, e.currentTarget.value, options, e.currentTarget.selectionStart, e.currentTarget);
      };
    },
    [updateField]
  );

  const createKeyDownHandler = useCallback(
    (name: Path<TFieldValues>, options: BetiOptions) => {
      return (e: React.KeyboardEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const { selectionStart, selectionEnd, value } = input;

        if (
          e.key === 'Backspace' &&
          options.currency?.symbolPosition === 'suffix' &&
          selectionStart === value.length &&
          selectionStart === selectionEnd
        ) {
          e.preventDefault();

          const rawDigits = value.replace(/[^0-9]/g, '');
          if (!rawDigits) return;

          const newRawDigits = rawDigits.slice(0, -1);
          updateField(name, newRawDigits, options, null, input);
        }
      };
    },
    [updateField]
  );

  const maskedFields = useMemo(() => {
    const fields: Partial<BetiFields<TSchema>> = {};

    for (const key in schema) {
      const config = schema[key];
      if (!config) continue;

      const options = getMaskOptions(config);
      const fieldName = key as unknown as Path<TFieldValues>;
      
      const { ref: rhfRef, name, onBlur: rhfOnBlur, ...rest } = register(fieldName, {
        validate: {
          betiFormat: (value) => {
            if (!options.validate) return true;
            if (!value) return true;

            let isValid = true;
            if (typeof options.validator === 'function') {
              isValid = options.validator(value);
            } else if (typeof options.validator === 'string' && VALIDATORS[options.validator]) {
              if (options.validator === 'date') {
                isValid = VALIDATORS.date(value, options.dateFormat);
              } else {
                isValid = VALIDATORS[options.validator](value);
              }
            }

            return isValid || (options.errorMessage || false);
          }
        }
      });

      const { onChange: _onChange, ...cleanRest } = rest;

      const formValue = getValues(fieldName);
      const stringValue = formValue !== undefined && formValue !== null ? String(formValue) : '';
      const effectiveOptions = getEffectiveOptions(options, stringValue);
      const { displayValue } = processInput(stringValue, effectiveOptions);

      const combinedRef = mergeRefs(rhfRef, (el: HTMLInputElement | null) => {
        fieldRefs.current[key] = el;
      });

      const handleChange = createChangeHandler(fieldName, options);
      const handleKeyDown = createKeyDownHandler(fieldName, options);
      const handleCompositionStart = createCompositionStartHandler();
      const handleCompositionEnd = createCompositionEndHandler(fieldName, options);

      const handleFocus = (_e: React.FocusEvent<HTMLInputElement>) => {
          setFocusedField(key);
          const formValue = getValues(fieldName);
          if (formValue !== undefined && formValue !== null) {
             const stringValue = String(formValue);
             const effectiveOptions = getEffectiveOptions(options, stringValue);
             const { cardType } = processInput(stringValue, effectiveOptions);
             
             if (cardType && options.onCardTypeChange) {
                options.onCardTypeChange(cardType);
             }
          }
      };

      const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          setFocusedField(null);
          rhfOnBlur(e);
      };

      const fieldObj: BetiField = {
        ...cleanRest,
        name,
        value: displayValue,
        rawValue: stringValue,
        ref: combinedRef,
        onChange: handleChange,
        onKeyDown: handleKeyDown,
        onCompositionStart: handleCompositionStart,
        onCompositionEnd: handleCompositionEnd,
        onBlur: handleBlur,
        onFocus: handleFocus,
        type: options.type || 'text',
        inputMode: options.inputMode || (options.currency ? 'decimal' : (options.mask ? 'tel' : 'text')),
        autoComplete: options.autoComplete ?? (options.type === 'email' ? 'email' : options.type === 'password' ? 'current-password' : 'off'),
        'aria-invalid': !!errors[key],
        'aria-describedby': options.mask ? `${name}-description` : undefined,
        title: options.mask,
      };

      fields[key as keyof TSchema] = fieldObj as any;
    }

    return fields as BetiFields<TSchema>;
  }, [
    schema, 
    register, 
    getValues, 
    createChangeHandler, 
    createKeyDownHandler, 
    createCompositionStartHandler, 
    createCompositionEndHandler, 
    getMaskOptions, 
    getEffectiveOptions, 
    focusedField, 
    errors
  ]);

  return maskedFields;
}
