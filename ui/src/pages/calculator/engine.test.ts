import { describe, expect, it } from "vitest";
import {
  CalculatorError,
  addMemory,
  applyOperator,
  clearMemory,
  evaluate,
  percentOf,
  percentOfBase,
  subtractMemory,
  toggleSign,
} from "./engine";

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

describe("calculator percent, sign, and memory", () => {
  it("turns a value into a percent and a percent of a base", () => {
    expect(percentOf(50)).toBe(0.5);
    expect(percentOfBase(200, 10)).toBe(20);
  });

  it("flips the sign and keeps zero at zero", () => {
    expect(toggleSign(12)).toBe(-12);
    expect(toggleSign(-4.5)).toBe(4.5);
    expect(toggleSign(0)).toBe(0);
  });

  it("clears, adds, and subtracts memory", () => {
    expect(clearMemory()).toBe(0);
    expect(addMemory(10, 2.5)).toBe(12.5);
    expect(subtractMemory(10, 3)).toBe(7);
  });
});
