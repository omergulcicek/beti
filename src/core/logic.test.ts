import { describe, it, expect } from "vitest";
import { VALIDATORS } from "./logic";

describe("Validators", () => {
  describe("TCKN", () => {
    it("should validate correct TCKN", () => {
      expect(VALIDATORS.tckn("12345678950")).toBe(true);
    });

    it("should invalidate wrong length", () => {
      expect(VALIDATORS.tckn("123")).toBe(false);
    });

    it("should invalidate non-numeric", () => {
      expect(VALIDATORS.tckn("123a5678901")).toBe(false);
    });
  });

  describe("Luhn (Credit Card)", () => {
    it("should validate correct card number", () => {
      expect(VALIDATORS.luhn("4539148803436467")).toBe(true);
    });

    it("should invalidate incorrect card number", () => {
      expect(VALIDATORS.luhn("4539148803436468")).toBe(false);
    });
  });

  describe("Email", () => {
    it("should validate correct email", () => {
      expect(VALIDATORS.email("test@example.com")).toBe(true);
    });

    it("should invalidate incorrect email", () => {
      expect(VALIDATORS.email("test@")).toBe(false);
      expect(VALIDATORS.email("test")).toBe(false);
    });
  });

  describe("Date", () => {
    it("should validate correct date (DMY)", () => {
      expect(VALIDATORS.date("31122023", "DMY")).toBe(true);
    });

    it("should invalidate incorrect date", () => {
      expect(VALIDATORS.date("32012023", "DMY")).toBe(false);
      expect(VALIDATORS.date("29022023", "DMY")).toBe(false);
    });
  });

  describe("Expiry", () => {
    it("should validate future expiry date", () => {
      const futureYear = (new Date().getFullYear() % 100) + 2;
      expect(VALIDATORS.expiry(`12${futureYear}`)).toBe(true);
    });

    it("should invalidate past expiry date", () => {
      expect(VALIDATORS.expiry("0120")).toBe(false);
    });
  });
});
