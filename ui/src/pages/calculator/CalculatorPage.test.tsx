// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { BreadcrumbProvider } from "../../context/BreadcrumbContext";
import { CalculatorPage } from "./CalculatorPage";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function renderPage() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root?.render(
      <BreadcrumbProvider>
        <CalculatorPage />
      </BreadcrumbProvider>,
    );
  });
}

function clickLabel(label: string) {
  const button = [...(container?.querySelectorAll("button") ?? [])].find((node) => node.textContent === label);
  if (!button) throw new Error(`Missing calculator key ${label}`);
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container?.remove();
  root = null;
  container = null;
});

describe("calculator page states", () => {
  it("shows an empty history before any calculation", () => {
    renderPage();
    expect(container?.querySelector("[data-testid='calculator-value']")?.textContent).toBe("0");
    expect(container?.querySelector("[data-testid='calculator-history-empty']")?.textContent).toBe(
      "No calculations yet",
    );
  });

  it("shows a divide-by-zero error and accepts a new entry", () => {
    renderPage();
    clickLabel("1");
    clickLabel("÷");
    clickLabel("0");
    clickLabel("=");
    expect(container?.textContent).toContain("Cannot divide by zero");
    expect(container?.querySelector("[data-testid='calculator-value']")?.textContent).toBe("Error");
    clickLabel("5");
    expect(container?.querySelector("[data-testid='calculator-value']")?.textContent).toBe("5");
    expect(container?.textContent).not.toContain("Cannot divide by zero");
  });
});
