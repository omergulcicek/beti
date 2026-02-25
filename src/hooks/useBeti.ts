'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FieldValues, Path, PathValue, useWatch } from 'react-hook-form';
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
  const { setValue, control, register } = form;
  const [isMounted, setIsMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cursorRequestRef = useRef<{ name: string; position: number } | null>(null);
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const isComposingRef = useRef(false);

  const handleCursor = useCallback(() => {
    if (cursorRequestRef.current) {
      const { name, position } = cursorRequestRef.current;
      const input = fieldRefs.current[name];
      if (input) {
        input.setSelectionRange(position, position);
      }
      cursorRequestRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (cursorRequestRef.current) {
      requestAnimationFrame(handleCursor);
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

  const schemaKeys = useMemo(() => Object.keys(schema), [schema]);
  const watchedValues = useWatch({ 
    control,
    name: schemaKeys as any 
  });

  const values = useMemo(() => {
    const v: Record<string, any> = {};
    if (Array.isArray(watchedValues)) {
      schemaKeys.forEach((key, i) => {
        v[key] = watchedValues[i];
      });
    } else if (schemaKeys.length === 1) {
       v[schemaKeys[0]] = watchedValues;
    }
    return v;
  }, [watchedValues, schemaKeys]);

  const getEffectiveOptions = useCallback((options: BetiOptions, value: string): BetiOptions => {
    if (options.resolveMask) {
      const resolvedMask = options.resolveMask(value, values, schema);
      if (resolvedMask) {
        return { ...options, mask: resolvedMask };
      }
    }
    return options;
  }, [schema, values]);

  const createChangeHandler = useCallback(
    (name: Path<TFieldValues>, options: BetiOptions) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isComposingRef.current) return;

        const input = e.target;
        const newValue = input.value;
        const selectionStart = input.selectionStart;

        const effectiveOptions = getEffectiveOptions(options, newValue);

        let previousDisplayValue = '';
        const currentRawValue = values?.[name as string];
        if (currentRawValue) {
           const oldEffectiveOptions = getEffectiveOptions(options, String(currentRawValue));
           const { displayValue } = processInput(String(currentRawValue), oldEffectiveOptions);
           previousDisplayValue = displayValue;
        }

        const { value: finalRawValue, displayValue: finalDisplayValue, cursorPosition, cardType } = processInput(
            newValue, 
            effectiveOptions, 
            selectionStart,
            previousDisplayValue
        );

        if (cardType && options.onCardTypeChange) {
            options.onCardTypeChange(cardType);
        }

        input.value = finalDisplayValue;
        
        setValue(name, finalRawValue as PathValue<TFieldValues, Path<TFieldValues>>, { 
            shouldValidate: true, 
            shouldDirty: true, 
            shouldTouch: true 
        });

        cursorRequestRef.current = { name, position: cursorPosition };
      };
    },
    [setValue, getEffectiveOptions, values]
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
        
        const input = e.currentTarget;
        const newValue = input.value;
        const selectionStart = input.selectionStart;
        
        const effectiveOptions = getEffectiveOptions(options, newValue);
        
        let previousDisplayValue = '';
        const currentRawValue = values?.[name as string];
        if (currentRawValue) {
           const oldEffectiveOptions = getEffectiveOptions(options, String(currentRawValue));
           const { displayValue } = processInput(String(currentRawValue), oldEffectiveOptions);
           previousDisplayValue = displayValue;
        }

        const { value: finalRawValue, displayValue: finalDisplayValue, cursorPosition, cardType } = processInput(
            newValue, 
            effectiveOptions, 
            selectionStart,
            previousDisplayValue
        );

        if (cardType && options.onCardTypeChange) {
            options.onCardTypeChange(cardType);
        }

        input.value = finalDisplayValue;
        
        setValue(name, finalRawValue as PathValue<TFieldValues, Path<TFieldValues>>, { 
            shouldValidate: true, 
            shouldDirty: true, 
            shouldTouch: true 
        });

        cursorRequestRef.current = { name, position: cursorPosition };
      };
    },
    [setValue, getEffectiveOptions, values]
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
          const effectiveOptions = getEffectiveOptions(options, newRawDigits);

          const { value: finalRawValue, displayValue: finalDisplayValue, cardType } = processInput(
            newRawDigits,
            effectiveOptions
          );

          if (cardType && options.onCardTypeChange) {
            options.onCardTypeChange(cardType);
          }

          setValue(name, finalRawValue as PathValue<TFieldValues, Path<TFieldValues>>, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });

          cursorRequestRef.current = { name, position: finalDisplayValue.length };
        }
      };
    },
    [setValue, getEffectiveOptions]
  );

  const maskedFields = useMemo(() => {
    const fields: Partial<BetiFields<TSchema>> = {};

    for (const key in schema) {
      const config = schema[key];
      if (!config) continue;

      const options = getMaskOptions(config);
      
      const { ref: rhfRef, name, onBlur: rhfOnBlur, ...rest } = register(key as unknown as Path<TFieldValues>, {
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

      const combinedRef = mergeRefs(rhfRef, (el: HTMLInputElement | null) => {
        fieldRefs.current[key] = el;
      });

      const handleChange = createChangeHandler(key as unknown as Path<TFieldValues>, options);
      const handleKeyDown = createKeyDownHandler(key as unknown as Path<TFieldValues>, options);
      const handleCompositionStart = createCompositionStartHandler();
      const handleCompositionEnd = createCompositionEndHandler(key as unknown as Path<TFieldValues>, options);

      const formValue = values?.[key as string];
      
      let displayValue = '';
      let rawValue = '';

      if (formValue !== undefined && formValue !== null) {
          const stringValue = String(formValue);
          const effectiveOptions = getEffectiveOptions(options, stringValue);
          const { displayValue: d, value: v } = processInput(stringValue, effectiveOptions);
          
          displayValue = d;
          rawValue = v;
      }

      const handleFocus = (_e: React.FocusEvent<HTMLInputElement>) => {
          setFocusedField(key);
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

      fields[key as keyof TSchema] = {
        ...cleanRest,
        name,
        ref: combinedRef,
        onChange: handleChange,
        onKeyDown: handleKeyDown,
        onCompositionStart: handleCompositionStart,
        onCompositionEnd: handleCompositionEnd,
        onBlur: handleBlur,
        onFocus: handleFocus,
        value: isMounted ? displayValue : '',
        rawValue: isMounted ? rawValue : '',
        type: options.type || 'text',
        inputMode: options.inputMode || (options.currency ? 'decimal' : (options.mask ? 'tel' : 'text')),
        autoComplete: options.autoComplete ?? (options.type === 'email' ? 'email' : options.type === 'password' ? 'current-password' : 'off'),
        'aria-invalid': !!form.formState.errors[key],
        'aria-describedby': options.mask ? `${name}-description` : undefined,
        title: options.mask,
      } as unknown as BetiField;
    }

    return fields as BetiFields<TSchema>;
  }, [schema, register, values, createChangeHandler, createKeyDownHandler, createCompositionStartHandler, createCompositionEndHandler, getMaskOptions, getEffectiveOptions, isMounted, focusedField, form.formState.errors]);

  return maskedFields;
}
