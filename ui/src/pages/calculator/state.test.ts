import { describe, expect, it } from "vitest";
import type { CalculatorAction } from "./keyboard";
import { createCalculatorState, displayValue, expressionText, reduceCalculator } from "./state";

function press(keys: CalculatorAction[]) {
  return keys.reduce(reduceCalculator, createCalculatorState());
}

const digit = (value: string): CalculatorAction => ({ type: "digit", digit: value });
const operator = (value: "+" | "-" | "*" | "/"): CalculatorAction => ({ type: "operator", operator: value });

describe("calculator session", () => {
  it("evaluates precedence and records history", () => {
    const state = press([
      digit("2"),
      operator("+"),
      digit("3"),
      operator("*"),
      digit("4"),
      { type: "equals" },
    ]);
    expect(displayValue(state)).toBe("14");
    expect(expressionText(state)).toBe("2+3*4 =");
    expect(state.history).toEqual([{ expression: "2+3*4", result: "14" }]);
  });

  it("resolves parentheses", () => {
    const state = press([
      { type: "paren", paren: "(" },
      digit("2"),
      operator("+"),
      digit("3"),
      { type: "paren", paren: ")" },
      operator("*"),
      digit("4"),
      { type: "equals" },
    ]);
    expect(displayValue(state)).toBe("20");
  });

  it("applies percent against the previous operand", () => {
    const state = press([
      digit("2"),
      digit("0"),
      digit("0"),
      operator("+"),
      digit("1"),
      digit("0"),
      { type: "percent" },
      { type: "equals" },
    ]);
    expect(displayValue(state)).toBe("220");
  });

  it("toggles the sign of the current entry", () => {
    const state = press([digit("1"), digit("2"), { type: "sign" }]);
    expect(displayValue(state)).toBe("-12");
  });

  it("stores, recalls, and clears memory", () => {
    const stored = press([digit("5"), { type: "memory", op: "add" }]);
    expect(stored.memory).toBe(5);
    const recalled = reduceCalculator(stored, { type: "allClear" });
    expect(recalled.memory).toBe(5);
    expect(displayValue(reduceCalculator(recalled, { type: "memory", op: "recall" }))).toBe("5");
    expect(reduceCalculator(stored, { type: "memory", op: "clear" }).memory).toBe(0);
  });

  it("deletes the last digit and then the operator", () => {
    const typed = press([digit("1"), digit("2"), operator("+"), digit("3")]);
    const withoutDigit = reduceCalculator(typed, { type: "backspace" });
    expect(displayValue(withoutDigit)).toBe("0");
    expect(withoutDigit.expression).toBe("12+");
    const withoutOperator = reduceCalculator(withoutDigit, { type: "backspace" });
    expect(withoutOperator.expression).toBe("");
    expect(displayValue(withoutOperator)).toBe("12");
  });

  it("reports division by zero", () => {
    const state = press([digit("1"), operator("/"), digit("0"), { type: "equals" }]);
    expect(state.error).toBe("Cannot divide by zero");
    expect(displayValue(state)).toBe("Error");
  });
});
