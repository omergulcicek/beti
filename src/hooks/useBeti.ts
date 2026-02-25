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
  const [fieldStates, setFieldStates] = useState<Record<string, { displayValue: string; rawValue?: string }>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fieldStatesRef = useRef(fieldStates);

  useEffect(() => {
    fieldStatesRef.current = fieldStates;
  }, [fieldStates]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cursorRequestRef = useRef<{ name: string; position: number } | null>(null);
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const values = useWatch({ control });

  const getEffectiveOptions = useCallback((options: BetiOptions, value: string): BetiOptions => {
    if (options.mask === '9999 9999 9999 9999') {
      const clean = value.replace(/\D/g, '');
      if (clean.startsWith('34') || clean.startsWith('37')) {
        return { ...options, mask: '9999 999999 99999' };
      }
    }

    const isCVV = options === PRESETS.cvv || (options.mask === '999' && options.inputMode === 'numeric');
    
    if (isCVV) {
       let cardFieldValue = '';
       
       for (const key in schema) {
          const fieldConfig = schema[key];
          const fieldOptions = typeof fieldConfig === 'string' ? PRESETS[fieldConfig as BetiPreset] : fieldConfig;
          
          const isCard = fieldConfig === 'card' || (typeof fieldConfig === 'object' && fieldConfig.preset === 'card') || (fieldOptions && (fieldOptions as BetiOptions).mask === '9999 9999 9999 9999');
          
          if (isCard) {
             const val = values?.[key];
             if (val) {
                cardFieldValue = String(val).replace(/\D/g, '');
                break;
             }
          }
       }

       if (cardFieldValue.startsWith('34') || cardFieldValue.startsWith('37')) {
          return { ...options, mask: '9999' };
       }
    }

    return options;
  }, [schema, values]);

  const createChangeHandler = useCallback(
    (name: Path<TFieldValues>, options: BetiOptions) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const newValue = input.value;
        const selectionStart = input.selectionStart;

        const effectiveOptions = getEffectiveOptions(options, newValue);

        const previousDisplayValue = fieldStatesRef.current[name]?.displayValue || '';
        const { value: finalRawValue, displayValue: finalDisplayValue, cursorPosition, cardType } = processInput(
            newValue, 
            effectiveOptions, 
            selectionStart,
            previousDisplayValue
        );

        if (cardType && options.onCardTypeChange) {
            options.onCardTypeChange(cardType);
        }

        setFieldStates(prev => ({
            ...prev,
            [name]: { displayValue: finalDisplayValue, rawValue: finalRawValue }
        }));

        input.value = finalDisplayValue;
        
        setValue(name, finalRawValue as PathValue<TFieldValues, Path<TFieldValues>>, { 
            shouldValidate: true, 
            shouldDirty: true, 
            shouldTouch: true 
        });

        cursorRequestRef.current = { name, position: cursorPosition };
      };
    },
    [setValue, getEffectiveOptions]
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

          setFieldStates((prev) => ({
            ...prev,
            [name]: { displayValue: finalDisplayValue, rawValue: finalRawValue },
          }));

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

      const formValue = values?.[key as string];
      const localState = fieldStates[key];
      
      let displayValue = '';
      let rawValue = '';

      const isFocused = focusedField === key;

      if (isFocused && localState) {
          displayValue = localState.displayValue;
          rawValue = localState.rawValue || '';
      } else {
          if (formValue !== undefined && formValue !== null) {
             const stringValue = String(formValue);
             const effectiveOptions = getEffectiveOptions(options, stringValue);
             const { displayValue: d, value: v } = processInput(stringValue, effectiveOptions);
             
             displayValue = d;
             rawValue = v;
          }
      }

      const handleFocus = () => {
          setFocusedField(key);
          if (formValue !== undefined && formValue !== null) {
             const stringValue = String(formValue);
             const effectiveOptions = getEffectiveOptions(options, stringValue);
             const { displayValue: d, value: v, cardType } = processInput(stringValue, effectiveOptions);
             
             if (cardType && options.onCardTypeChange) {
                options.onCardTypeChange(cardType);
             }

             setFieldStates(prev => ({
                ...prev,
                [key]: { displayValue: d, rawValue: v }
             }));
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
  }, [schema, register, values, createChangeHandler, createKeyDownHandler, getMaskOptions, getEffectiveOptions, isMounted, fieldStates, focusedField, form.formState.errors]);

  useEffect(() => {
    if (focusedField) {
        const formValue = values?.[focusedField];
        const localState = fieldStates[focusedField];
        
        if (formValue !== undefined && formValue !== null && String(formValue) !== localState?.rawValue) {
            const config = schema[focusedField];
            if (config) {
                const options = getMaskOptions(config);
                const stringValue = String(formValue);
                const effectiveOptions = getEffectiveOptions(options, stringValue);
                const { displayValue: d, value: v, cardType } = processInput(stringValue, effectiveOptions);
                
                if (cardType && options.onCardTypeChange) {
                    options.onCardTypeChange(cardType);
                }

                setFieldStates(prev => ({
                    ...prev,
                    [focusedField]: { displayValue: d, rawValue: v }
                }));
            }
        }
    }
  }, [values, focusedField, fieldStates, schema, getMaskOptions, getEffectiveOptions]);

  return maskedFields;
}
