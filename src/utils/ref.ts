import { MutableRefObject, RefCallback } from 'react';

type Ref<T> = MutableRefObject<T | null> | RefCallback<T> | null;

export function mergeRefs<T>(...refs: Ref<T>[]): RefCallback<T> {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as MutableRefObject<T | null>).current = value;
      }
    });
  };
}
