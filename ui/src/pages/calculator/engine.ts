export class CalculatorError extends Error {
  readonly code: "divide_by_zero" | "invalid_expression";

  constructor(code: CalculatorError["code"], message: string) {
    super(message);
    this.name = "CalculatorError";
    this.code = code;
  }
}

export type BinaryOperator = "+" | "-" | "*" | "/";

const BINARY_OPERATORS = new Set<string>(["+", "-", "*", "/"]);

export function isBinaryOperator(value: string): value is BinaryOperator {
  return BINARY_OPERATORS.has(value);
}

export function roundResult(value: number): number {
  if (!Number.isFinite(value)) {
    throw new CalculatorError("invalid_expression", "Result is not a finite number");
  }
  return Number(value.toPrecision(12));
}

export function applyOperator(left: number, operator: BinaryOperator, right: number): number {
  if (operator === "+") return roundResult(left + right);
  if (operator === "-") return roundResult(left - right);
  if (operator === "*") return roundResult(left * right);
  if (right === 0) {
    throw new CalculatorError("divide_by_zero", "Cannot divide by zero");
  }
  return roundResult(left / right);
}

type Token =
  | { kind: "number"; value: number }
  | { kind: "operator"; operator: BinaryOperator };

function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

function readNumber(source: string, index: number, signed: boolean): { value: number; next: number } | null {
  let cursor = index;
  if (signed) {
    if (source[cursor] !== "-") return null;
    cursor += 1;
  }
  const digitsStart = cursor;
  let sawDigit = false;
  while (cursor < source.length && isDigit(source[cursor] ?? "")) {
    sawDigit = true;
    cursor += 1;
  }
  if (source[cursor] === ".") {
    cursor += 1;
    let sawFraction = false;
    while (cursor < source.length && isDigit(source[cursor] ?? "")) {
      sawFraction = true;
      cursor += 1;
    }
    if (!sawFraction) return null;
    sawDigit = true;
  }
  if (!sawDigit || cursor === digitsStart) return null;
  const value = Number(source.slice(index, cursor));
  if (!Number.isFinite(value)) return null;
  return { value, next: cursor };
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  while (index < expression.length) {
    const expectNumber = tokens.length === 0 || tokens[tokens.length - 1]?.kind === "operator";
    if (expectNumber) {
      const signed = expression[index] === "-" && (tokens.length === 0 || tokens[tokens.length - 1]?.kind === "operator");
      const parsed = readNumber(expression, index, signed);
      if (parsed === null) {
        throw new CalculatorError("invalid_expression", "Expression is invalid");
      }
      tokens.push({ kind: "number", value: parsed.value });
      index = parsed.next;
      continue;
    }
    const char = expression[index] ?? "";
    if (!isBinaryOperator(char)) {
      throw new CalculatorError("invalid_expression", "Expression is invalid");
    }
    tokens.push({ kind: "operator", operator: char });
    index += 1;
  }
  return tokens;
}

/** Evaluate `+ - * /` from left to right. Precedence arrives in a later change. */
export function evaluate(expression: string): number {
  const source = expression.replace(/\s+/g, "");
  if (source.length === 0) {
    throw new CalculatorError("invalid_expression", "Expression is empty");
  }
  const tokens = tokenize(source);
  const first = tokens[0];
  if (first?.kind !== "number") {
    throw new CalculatorError("invalid_expression", "Expression is invalid");
  }
  let result = first.value;
  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index];
    const right = tokens[index + 1];
    if (operator?.kind !== "operator" || right?.kind !== "number") {
      throw new CalculatorError("invalid_expression", "Expression is invalid");
    }
    result = applyOperator(result, operator.operator, right.value);
  }
  return result;
}
