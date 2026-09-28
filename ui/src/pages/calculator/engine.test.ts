import { describe, expect, it } from "vitest";
import { CalculatorError, applyOperator, evaluate } from "./engine";

describe("calculator arithmetic", () => {
  it("adds, subtracts, multiplies, and divides", () => {
    expect(evaluate("2+3")).toBe(5);
    expect(evaluate("10-4")).toBe(6);
    expect(evaluate("6*7")).toBe(42);
    expect(evaluate("8/2")).toBe(4);
  });

  it("chains operations from left to right", () => {
    expect(evaluate("1+2+3")).toBe(6);
    expect(evaluate("20-5-3")).toBe(12);
    expect(evaluate("2*3*4")).toBe(24);
    expect(evaluate("100/5/4")).toBe(5);
  });

  it("accepts decimals and surrounding spaces", () => {
    expect(evaluate("1.5 + 2.25")).toBe(3.75);
    expect(evaluate("0.1*3")).toBe(0.3);
  });

  it("rejects division by zero", () => {
    expect(() => evaluate("1/0")).toThrow(CalculatorError);
    expect(() => applyOperator(4, "/", 0)).toThrowError(
      expect.objectContaining({ code: "divide_by_zero" }),
    );
  });

  it("rejects an empty expression", () => {
    expect(() => evaluate("   ")).toThrowError(
      expect.objectContaining({ code: "invalid_expression" }),
    );
  });
});
