import type { BinaryOperator } from "./engine";

export type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "decimal" }
  | { type: "operator"; operator: BinaryOperator }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "allClear" }
  | { type: "backspace" }
  | { type: "percent" }
  | { type: "sign" }
  | { type: "paren"; paren: "(" | ")" }
  | { type: "memory"; op: "clear" | "recall" | "add" | "subtract" };

export function actionFromKey(key: string): CalculatorAction | null {
  if (key.length === 1 && key >= "0" && key <= "9") {
    return { type: "digit", digit: key };
  }
  if (key === "." || key === ",") return { type: "decimal" };
  if (key === "+") return { type: "operator", operator: "+" };
  if (key === "-") return { type: "operator", operator: "-" };
  if (key === "*" || key === "x" || key === "X") return { type: "operator", operator: "*" };
  if (key === "/") return { type: "operator", operator: "/" };
  if (key === "Enter" || key === "=") return { type: "equals" };
  if (key === "Escape") return { type: "allClear" };
  if (key === "Delete") return { type: "clear" };
  if (key === "Backspace") return { type: "backspace" };
  if (key === "%") return { type: "percent" };
  if (key === "(" || key === ")") return { type: "paren", paren: key };
  return null;
}
