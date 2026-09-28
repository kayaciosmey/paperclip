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

export function toggleSign(value: number): number {
  if (value === 0) return 0;
  return roundResult(-value);
}

/** Standalone percent: 50% is 0.5. Also used for multiply and divide. */
export function percentOf(value: number): number {
  return roundResult(value / 100);
}

/**
 * Percent of a previous operand. `200 + 10%` contributes 20, and
 * `200 - 10%` contributes 20.
 */
export function percentOfBase(base: number, value: number): number {
  return roundResult(base * (value / 100));
}

export function clearMemory(): number {
  return 0;
}

export function addMemory(memory: number, value: number): number {
  return roundResult(memory + value);
}

export function subtractMemory(memory: number, value: number): number {
  return roundResult(memory - value);
}

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

type Parser = { source: string; index: number };

function peek(parser: Parser): string {
  return parser.source[parser.index] ?? "";
}

function parseExpression(parser: Parser): number {
  let value = parseTerm(parser);
  while (peek(parser) === "+" || peek(parser) === "-") {
    const operator = peek(parser) as "+" | "-";
    parser.index += 1;
    value = applyOperator(value, operator, parseTerm(parser));
  }
  return value;
}

function parseTerm(parser: Parser): number {
  let value = parseUnary(parser);
  while (peek(parser) === "*" || peek(parser) === "/") {
    const operator = peek(parser) as "*" | "/";
    parser.index += 1;
    value = applyOperator(value, operator, parseUnary(parser));
  }
  return value;
}

function parseUnary(parser: Parser): number {
  if (peek(parser) === "-") {
    parser.index += 1;
    return applyOperator(0, "-", parseUnary(parser));
  }
  return parsePrimary(parser);
}

function parsePrimary(parser: Parser): number {
  if (peek(parser) === "(") {
    parser.index += 1;
    const value = parseExpression(parser);
    if (peek(parser) !== ")") {
      throw new CalculatorError("invalid_expression", "Missing closing parenthesis");
    }
    parser.index += 1;
    return value;
  }
  const parsed = readNumber(parser.source, parser.index, false);
  if (parsed === null) {
    throw new CalculatorError("invalid_expression", "Expression is invalid");
  }
  parser.index = parsed.next;
  return parsed.value;
}

/** Evaluate with operator precedence and parentheses. `*` and `/` bind tighter than `+` and `-`. */
export function evaluate(expression: string): number {
  const source = expression.replace(/\s+/g, "");
  if (source.length === 0) {
    throw new CalculatorError("invalid_expression", "Expression is empty");
  }
  const parser: Parser = { source, index: 0 };
  const result = parseExpression(parser);
  if (parser.index !== source.length) {
    throw new CalculatorError("invalid_expression", "Expression is invalid");
  }
  return result;
}
