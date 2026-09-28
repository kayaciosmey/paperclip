import { describe, expect, it } from "vitest";
import { actionFromKey } from "./keyboard";

describe("calculator keyboard", () => {
  it("maps digits, a decimal point, and operators", () => {
    expect(actionFromKey("7")).toEqual({ type: "digit", digit: "7" });
    expect(actionFromKey(".")).toEqual({ type: "decimal" });
    expect(actionFromKey(",")).toEqual({ type: "decimal" });
    expect(actionFromKey("+")).toEqual({ type: "operator", operator: "+" });
    expect(actionFromKey("-")).toEqual({ type: "operator", operator: "-" });
    expect(actionFromKey("*")).toEqual({ type: "operator", operator: "*" });
    expect(actionFromKey("x")).toEqual({ type: "operator", operator: "*" });
    expect(actionFromKey("/")).toEqual({ type: "operator", operator: "/" });
  });

  it("maps equals, clear, and backspace", () => {
    expect(actionFromKey("Enter")).toEqual({ type: "equals" });
    expect(actionFromKey("=")).toEqual({ type: "equals" });
    expect(actionFromKey("Escape")).toEqual({ type: "allClear" });
    expect(actionFromKey("Delete")).toEqual({ type: "clear" });
    expect(actionFromKey("Backspace")).toEqual({ type: "backspace" });
  });

  it("maps percent and parentheses", () => {
    expect(actionFromKey("%")).toEqual({ type: "percent" });
    expect(actionFromKey("(")).toEqual({ type: "paren", paren: "(" });
    expect(actionFromKey(")")).toEqual({ type: "paren", paren: ")" });
  });

  it("ignores unrelated keys", () => {
    expect(actionFromKey("a")).toBeNull();
    expect(actionFromKey("Shift")).toBeNull();
  });
});
