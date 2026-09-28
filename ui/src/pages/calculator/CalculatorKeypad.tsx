import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalculatorAction } from "./keyboard";

type KeySpec = {
  label: string;
  action: CalculatorAction;
  variant: "secondary" | "outline" | "default";
  span?: 2;
};

const ROWS: KeySpec[][] = [
  [
    { label: "MC", action: { type: "memory", op: "clear" }, variant: "secondary" },
    { label: "MR", action: { type: "memory", op: "recall" }, variant: "secondary" },
    { label: "M+", action: { type: "memory", op: "add" }, variant: "secondary" },
    { label: "M−", action: { type: "memory", op: "subtract" }, variant: "secondary" },
  ],
  [
    { label: "AC", action: { type: "allClear" }, variant: "secondary" },
    { label: "⌫", action: { type: "backspace" }, variant: "secondary" },
    { label: "%", action: { type: "percent" }, variant: "secondary" },
    { label: "÷", action: { type: "operator", operator: "/" }, variant: "secondary" },
  ],
  [
    { label: "(", action: { type: "paren", paren: "(" }, variant: "secondary" },
    { label: ")", action: { type: "paren", paren: ")" }, variant: "secondary" },
    { label: "±", action: { type: "sign" }, variant: "secondary" },
    { label: "×", action: { type: "operator", operator: "*" }, variant: "secondary" },
  ],
  [
    { label: "7", action: { type: "digit", digit: "7" }, variant: "outline" },
    { label: "8", action: { type: "digit", digit: "8" }, variant: "outline" },
    { label: "9", action: { type: "digit", digit: "9" }, variant: "outline" },
    { label: "−", action: { type: "operator", operator: "-" }, variant: "secondary" },
  ],
  [
    { label: "4", action: { type: "digit", digit: "4" }, variant: "outline" },
    { label: "5", action: { type: "digit", digit: "5" }, variant: "outline" },
    { label: "6", action: { type: "digit", digit: "6" }, variant: "outline" },
    { label: "+", action: { type: "operator", operator: "+" }, variant: "secondary" },
  ],
  [
    { label: "1", action: { type: "digit", digit: "1" }, variant: "outline" },
    { label: "2", action: { type: "digit", digit: "2" }, variant: "outline" },
    { label: "3", action: { type: "digit", digit: "3" }, variant: "outline" },
    { label: "=", action: { type: "equals" }, variant: "default" },
  ],
  [
    { label: "0", action: { type: "digit", digit: "0" }, variant: "outline", span: 2 },
    { label: ".", action: { type: "decimal" }, variant: "outline", span: 2 },
  ],
];

export function CalculatorKeypad({ onAction }: { onAction: (action: CalculatorAction) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2" data-slot="calculator-keypad">
      {ROWS.flat().map((key) => (
        <Button
          key={key.label}
          type="button"
          variant={key.variant}
          className={cn("font-mono", key.span === 2 && "col-span-2")}
          onClick={() => onAction(key.action)}
        >
          {key.label}
        </Button>
      ))}
    </div>
  );
}
