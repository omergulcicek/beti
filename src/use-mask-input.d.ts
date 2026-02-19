declare module "use-mask-input" {
  export function useHookFormMask<TFieldValues extends Record<string, unknown> = Record<string, unknown>>(
    register: (name: keyof TFieldValues & string) => Record<string, unknown>
  ): (
    name: keyof TFieldValues & string,
    mask: string,
    options?: Record<string, unknown>
  ) => Record<string, unknown>;
}


