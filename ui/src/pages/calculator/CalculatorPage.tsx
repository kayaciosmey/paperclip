import { useCallback, useEffect, useState } from "react";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";
import { CalculatorDisplay } from "./CalculatorDisplay";
import { CalculatorKeypad } from "./CalculatorKeypad";
import type { HistoryEntry } from "./history";
import { actionFromKey, type CalculatorAction } from "./keyboard";
import { createCalculatorState, displayValue, expressionText, reduceCalculator } from "./state";

export function CalculatorPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const [state, setState] = useState(createCalculatorState);

  useEffect(() => {
    setBreadcrumbs([{ label: "Calculator" }]);
  }, [setBreadcrumbs]);

  const dispatch = useCallback((action: CalculatorAction) => {
    setState((current) => reduceCalculator(current, action));
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, [contenteditable='true']")) return;
      const action = actionFromKey(event.key);
      if (!action) return;
      event.preventDefault();
      dispatch(action);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 p-4">
      <CalculatorDisplay
        expression={expressionText(state)}
        value={displayValue(state)}
        memoryActive={state.memory !== 0}
      />
      <CalculatorKeypad onAction={dispatch} />
      <CalculatorHistory history={state.history} />
    </div>
  );
}

function CalculatorHistory({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) return null;
  const newestFirst = [...history].reverse();
  return (
    <ol className="flex flex-col gap-1 text-sm text-muted-foreground" data-testid="calculator-history">
      {newestFirst.map((item) => (
        <li key={`${item.expression}=${item.result}`} className="flex items-baseline justify-between gap-3 font-mono">
          <span className="truncate">{item.expression}</span>
          <span className="text-foreground">{item.result}</span>
        </li>
      ))}
    </ol>
  );
}
