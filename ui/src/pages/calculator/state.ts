import {
  addMemory,
  CalculatorError,
  evaluate,
  isBinaryOperator,
  percentOf,
  percentOfBase,
  roundResult,
  subtractMemory,
} from "./engine";
import { appendHistory, type HistoryEntry } from "./history";
import type { CalculatorAction } from "./keyboard";

const MAX_DIGITS = 12;

export type CalculatorState = {
  expression: string;
  entry: string;
  memory: number;
  error: string | null;
  history: HistoryEntry[];
  justComputed: boolean;
  openParens: number;
};

export function createCalculatorState(): CalculatorState {
  return {
    expression: "",
    entry: "",
    memory: 0,
    error: null,
    history: [],
    justComputed: false,
    openParens: 0,
  };
}

export function formatNumber(value: number): string {
  const rounded = roundResult(value);
  const text = String(rounded);
  if (!text.includes("e") && text.length > 14) return rounded.toExponential(6);
  return text;
}

export function displayValue(state: CalculatorState): string {
  if (state.error) return "Error";
  if (state.entry.length > 0) return state.entry;
  return "0";
}

export function expressionText(state: CalculatorState): string {
  if (state.justComputed) return `${state.expression} =`;
  return `${state.expression}${state.entry}`;
}

function startsFresh(action: CalculatorAction): boolean {
  return action.type === "digit" || action.type === "decimal" || (action.type === "paren" && action.paren === "(");
}

export function reduceCalculator(state: CalculatorState, action: CalculatorAction): CalculatorState {
  if (state.error) {
    if (startsFresh(action)) {
      return reduceCalculator(
        { ...createCalculatorState(), memory: state.memory, history: state.history },
        action,
      );
    }
    if (action.type === "allClear" || action.type === "clear" || action.type === "backspace") {
      return { ...createCalculatorState(), memory: state.memory, history: state.history };
    }
    return state;
  }
  switch (action.type) {
    case "digit":
      return inputDigit(state, action.digit);
    case "decimal":
      return inputDecimal(state);
    case "operator":
      return inputOperator(state, action.operator);
    case "equals":
      return inputEquals(state);
    case "clear":
      return clearEntry(state);
    case "allClear":
      return { ...createCalculatorState(), memory: state.memory, history: state.history };
    case "backspace":
      return inputBackspace(state);
    case "percent":
      return inputPercent(state);
    case "sign":
      return inputSign(state);
    case "paren":
      return action.paren === "(" ? inputOpenParen(state) : inputCloseParen(state);
    case "memory":
      return inputMemory(state, action.op);
    default:
      return state;
  }
}

function digitCount(entry: string): number {
  return entry.replace("-", "").replace(".", "").length;
}

function inputDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.justComputed) {
    return { ...state, expression: "", entry: digit, justComputed: false, openParens: 0, error: null };
  }
  if (state.entry === "0") return { ...state, entry: digit };
  if (state.entry === "-0") return { ...state, entry: `-${digit}` };
  if (digitCount(state.entry) >= MAX_DIGITS) return state;
  return { ...state, entry: `${state.entry}${digit}` };
}

function inputDecimal(state: CalculatorState): CalculatorState {
  if (state.justComputed) {
    return { ...state, expression: "", entry: "0.", justComputed: false, openParens: 0, error: null };
  }
  if (state.entry.includes(".")) return state;
  if (state.entry.length === 0 || state.entry === "-") return { ...state, entry: `${state.entry}0.` };
  return { ...state, entry: `${state.entry}.` };
}

function commitEntry(entry: string): string {
  let text = entry;
  if (text.endsWith(".")) text = text.slice(0, -1);
  if (text.length === 0 || text === "-" || text === "-0") return text === "-0" ? "0" : "";
  return text;
}

function inputOperator(state: CalculatorState, operator: "+" | "-" | "*" | "/"): CalculatorState {
  if (state.justComputed) {
    return {
      ...state,
      expression: `${formatNumber(Number(state.entry))}${operator}`,
      entry: "",
      justComputed: false,
      openParens: 0,
      error: null,
    };
  }
  const committed = commitEntry(state.entry);
  if (committed.length > 0) {
    return { ...state, expression: `${state.expression}${committed}${operator}`, entry: "", error: null };
  }
  if (endsWithBinaryOperator(state.expression)) {
    return { ...state, expression: `${state.expression.slice(0, -1)}${operator}` };
  }
  if (state.expression.endsWith(")")) {
    return { ...state, expression: `${state.expression}${operator}` };
  }
  return state;
}

function inputEquals(state: CalculatorState): CalculatorState {
  const committed = commitEntry(state.entry);
  const formula = `${state.expression}${committed}`;
  if (formula.length === 0 || endsWithBinaryOperator(formula) || formula.endsWith("(")) return state;
  const closed = `${formula}${")".repeat(state.openParens)}`;
  try {
    const result = formatNumber(evaluate(closed));
    return {
      ...state,
      expression: closed,
      entry: result,
      error: null,
      justComputed: true,
      openParens: 0,
      history: appendHistory(state.history, { expression: closed, result }),
    };
  } catch (error) {
    const message = error instanceof CalculatorError ? error.message : "Expression is invalid";
    return { ...state, expression: closed, entry: "", error: message, justComputed: false };
  }
}

function clearEntry(state: CalculatorState): CalculatorState {
  if (state.justComputed || state.error) {
    return { ...createCalculatorState(), memory: state.memory, history: state.history };
  }
  return { ...state, entry: "", error: null };
}

function inputBackspace(state: CalculatorState): CalculatorState {
  if (state.justComputed) {
    return { ...createCalculatorState(), memory: state.memory, history: state.history };
  }
  if (state.entry.length > 0) return { ...state, entry: state.entry.slice(0, -1) };
  if (state.expression.length === 0) return state;
  const last = state.expression[state.expression.length - 1] ?? "";
  let openParens = state.openParens;
  if (last === "(") openParens -= 1;
  if (last === ")") openParens += 1;
  const sliced = state.expression.slice(0, -1);
  const detached = takeTrailingEntry(sliced);
  if (detached) {
    return { ...state, expression: detached.expression, entry: detached.entry, openParens };
  }
  return { ...state, expression: sliced, openParens };
}

function inputPercent(state: CalculatorState): CalculatorState {
  const current = Number(commitEntry(state.entry) || "0");
  if (!Number.isFinite(current)) return state;
  const operator = trailingBinaryOperator(state.expression);
  if ((operator === "+" || operator === "-") && state.expression.length > 1) {
    try {
      const base = evaluate(state.expression.slice(0, -1));
      return { ...state, entry: formatNumber(percentOfBase(base, current)), justComputed: false };
    } catch {
      return { ...state, error: "Expression is invalid", entry: "" };
    }
  }
  return { ...state, entry: formatNumber(percentOf(current)), justComputed: false };
}

function inputSign(state: CalculatorState): CalculatorState {
  if (state.justComputed) {
    const next = formatNumber(Number(state.entry) * -1 || 0);
    return { ...state, entry: next === "0" ? "0" : next, expression: "", justComputed: false, openParens: 0 };
  }
  if (state.entry.startsWith("-")) return { ...state, entry: state.entry.slice(1) };
  if (state.entry.length === 0 || state.entry === "0") return { ...state, entry: "-" };
  return { ...state, entry: `-${state.entry}` };
}

function inputOpenParen(state: CalculatorState): CalculatorState {
  if (state.justComputed) {
    return { ...createCalculatorState(), memory: state.memory, history: state.history, expression: "(", openParens: 1 };
  }
  const committed = commitEntry(state.entry);
  if (committed.length > 0) {
    return {
      ...state,
      expression: `${state.expression}${committed}*(`,
      entry: "",
      openParens: state.openParens + 1,
    };
  }
  if (state.expression.endsWith(")") || /\d$/.test(state.expression)) {
    return { ...state, expression: `${state.expression}*(`, openParens: state.openParens + 1 };
  }
  return { ...state, expression: `${state.expression}(`, openParens: state.openParens + 1 };
}

function inputCloseParen(state: CalculatorState): CalculatorState {
  if (state.openParens <= 0) return state;
  const committed = commitEntry(state.entry);
  if (committed.length === 0) {
    if (state.expression.endsWith("(") || endsWithBinaryOperator(state.expression)) return state;
    return { ...state, expression: `${state.expression})`, openParens: state.openParens - 1 };
  }
  return {
    ...state,
    expression: `${state.expression}${committed})`,
    entry: "",
    openParens: state.openParens - 1,
  };
}

function inputMemory(state: CalculatorState, op: "clear" | "recall" | "add" | "subtract"): CalculatorState {
  if (op === "clear") return { ...state, memory: 0 };
  if (op === "recall") {
    const entry = formatNumber(state.memory);
    if (state.justComputed) {
      return { ...state, expression: "", entry, justComputed: false, openParens: 0, error: null };
    }
    return { ...state, entry, error: null };
  }
  const value = memorySource(state);
  const memory = op === "add" ? addMemory(state.memory, value) : subtractMemory(state.memory, value);
  return { ...state, memory };
}

function memorySource(state: CalculatorState): number {
  const committed = commitEntry(state.entry);
  if (committed.length > 0) return Number(committed);
  if (state.expression.length > 0 && !endsWithBinaryOperator(state.expression) && !state.expression.endsWith("(")) {
    try {
      return evaluate(`${state.expression}${")".repeat(state.openParens)}`);
    } catch {
      return 0;
    }
  }
  return 0;
}

function endsWithBinaryOperator(expression: string): boolean {
  return trailingBinaryOperator(expression) !== null;
}

function trailingBinaryOperator(expression: string): "+" | "-" | "*" | "/" | null {
  const last = expression[expression.length - 1];
  if (!last || !isBinaryOperator(last)) return null;
  if (last !== "-") return last;
  const before = expression[expression.length - 2];
  if (!before || before === "(" || before === "*" || before === "/") return null;
  return "-";
}

function takeTrailingEntry(expression: string): { expression: string; entry: string } | null {
  const match = /^(.*?)(\d+(?:\.\d+)?)$/.exec(expression);
  if (!match) return null;
  let prefix = match[1] ?? "";
  let entry = match[2] ?? "";
  if (prefix.endsWith("-")) {
    const before = prefix.slice(0, -1);
    const prior = before[before.length - 1];
    if (before.length === 0 || prior === "(" || prior === "*" || prior === "/") {
      prefix = before;
      entry = `-${entry}`;
    }
  }
  if (prefix === expression) return null;
  return { expression: prefix, entry };
}
