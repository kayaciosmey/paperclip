import { cn } from "@/lib/utils";

export function CalculatorDisplay({
  expression,
  value,
  memoryActive,
  error,
}: {
  expression: string;
  value: string;
  memoryActive: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3" data-slot="calculator-display">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="min-h-4 truncate font-mono">{expression.length > 0 ? expression : "\u00a0"}</span>
        {memoryActive ? <span aria-label="Memory stored">M</span> : <span aria-hidden="true">{"\u00a0"}</span>}
      </div>
      <div
        className={cn(
          "mt-1 truncate text-right font-mono text-3xl",
          error ? "text-destructive" : "text-foreground",
        )}
        data-testid="calculator-value"
      >
        {value}
      </div>
      {error ? (
        <p className="mt-1 text-right text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
