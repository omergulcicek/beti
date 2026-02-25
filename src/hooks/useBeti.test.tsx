import { renderHook, act, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, it, expect } from "vitest";
import { useBeti } from "./useBeti";
import { PRESETS } from "../core/presets";

window.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);

describe("useBeti", () => {
  it("should initialize correctly", () => {
    const { result } = renderHook(() => {
      const form = useForm({
        defaultValues: {
          phone: "",
        },
      });
      
      const fields = useBeti({
        form,
        schema: {
          phone: PRESETS.phone,
        },
      });

      return { form, fields };
    });

    expect(result.current.fields.phone).toBeDefined();
    expect(result.current.fields.phone.name).toBe("phone");
  });

  it("should format initial value", async () => {
    const { result } = renderHook(() => {
      const form = useForm({
        defaultValues: {
          phone: "5551234567",
        },
      });
      
      const fields = useBeti({
        form,
        schema: {
          phone: PRESETS.phone,
        },
      });

      return { form, fields };
    });

    await waitFor(() => {
      expect(result.current.fields.phone.value).toBe("(555) 123 45 67");
    });
  });

  it("should handle input change", async () => {
    const { result } = renderHook(() => {
      const form = useForm({
        defaultValues: {
          phone: "",
        },
      });
      
      const fields = useBeti({
        form,
        schema: {
          phone: PRESETS.phone,
        },
      });

      return { form, fields };
    });

    const input = document.createElement("input");
    input.value = "555";
    input.selectionStart = 3;
    
    const event = {
      target: input,
      currentTarget: input,
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      result.current.fields.phone.onChange(event);
    });

    expect(result.current.form.getValues("phone")).toBe("555");
  });
});
