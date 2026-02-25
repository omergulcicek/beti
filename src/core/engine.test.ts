import { describe, it, expect } from "vitest";
import {
  applyMask,
  cleanValue,
  formatCurrency,
  getCardType,
  processInput,
  stripMask,
  toSlug,
  unformatCurrency,
  unmask,
} from "./engine";
import { PRESETS } from "./presets";

describe("Core Engine", () => {
  describe("toSlug", () => {
    it("should convert string to slug", () => {
      expect(toSlug("Hello World")).toBe("hello-world");
      expect(toSlug("Ömer Gülçiçek")).toBe("omer-gulcicek");
      expect(toSlug("  Multiple   Spaces  ")).toBe("multiple-spaces");
      expect(toSlug("Special!@#Characters")).toBe("specialcharacters");
    });
  });

  describe("cleanValue", () => {
    it("should remove forbidden characters", () => {
      expect(cleanValue("abc123", undefined, /[a-z]/g)).toBe("123");
    });

    it("should keep only allowed characters", () => {
      expect(cleanValue("abc123", /[0-9]/)).toBe("123");
    });

    it("should handle both allowed and forbidden characters", () => {
      expect(cleanValue("abc123", /[0-9]/, /1/)).toBe("23");
    });
  });

  describe("applyMask", () => {
    it("should format phone number correctly", () => {
      const mask = "(999) 999 99 99";
      expect(applyMask("5551234567", mask)).toBe("(555) 123 45 67");
    });

    it("should handle partial inputs", () => {
      const mask = "99/99/9999";
      expect(applyMask("1205", mask)).toBe("12/05");
    });

    it("should handle alphanumeric mask", () => {
      const mask = "AA-99";
      expect(applyMask("AB12", mask)).toBe("AB-12");
    });

    it("should skip static characters in input", () => {
      const mask = "(999)";
      expect(applyMask("555", mask)).toBe("(555");
    });
  });

  describe("unmask", () => {
    it("should remove mask characters", () => {
      expect(unmask("(555) 123 45 67", "(999) 999 99 99")).toBe("5551234567");
    });
  });

  describe("stripMask", () => {
    it("should strip mask characters but keep values", () => {
      expect(stripMask("(555) 123", "(999) 999")).toBe("555123");
    });
  });

  describe("formatCurrency", () => {
    it("should format currency with defaults", () => {
      expect(formatCurrency("123456", {})).toBe("1.234,56");
    });

    it("should format with custom symbol", () => {
      expect(formatCurrency("123456", { symbol: "$" })).toBe("$1.234,56");
    });

    it("should format with custom precision", () => {
      expect(formatCurrency("123456", { precision: 3 })).toBe("123,456");
    });
  });

  describe("unformatCurrency", () => {
    it("should unformat currency string", () => {
      expect(unformatCurrency("1.234,56", {})).toBe("1234.56");
    });
  });

  describe("getCardType", () => {
    it("should identify Visa", () => {
      expect(getCardType("4111")).toBe("visa");
    });

    it("should identify Mastercard", () => {
      expect(getCardType("5100")).toBe("mastercard");
    });

    it("should identify Amex", () => {
      expect(getCardType("3400")).toBe("amex");
    });

    it("should identify Troy", () => {
      expect(getCardType("9792")).toBe("troy");
    });

    it("should return unknown for others", () => {
      expect(getCardType("1234")).toBe("unknown");
    });
  });

  describe("processInput", () => {
    it("should process masked input", () => {
      const result = processInput("5551234567", { mask: "(999) 999 99 99" });
      expect(result.displayValue).toBe("(555) 123 45 67");
      expect(result.value).toBe("5551234567");
    });

    it("should process currency input", () => {
      const result = processInput("123456", PRESETS.currency);
      expect(result.displayValue).toBe("1.234,56");
      expect(result.value).toBe("1234.56");
    });

    it("should process uppercase transform", () => {
      const result = processInput("abc", { transform: "uppercase" });
      expect(result.displayValue).toBe("ABC");
      expect(result.value).toBe("abc");
    });
  });
});
