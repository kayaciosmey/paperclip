import { describe, expect, it } from "vitest";
import { appendHistory, type HistoryEntry } from "./history";

function entry(expression: string, result: string): HistoryEntry {
  return { expression, result };
}

describe("calculator history", () => {
  it("appends a result", () => {
    expect(appendHistory([], entry("1+1", "2"))).toEqual([entry("1+1", "2")]);
  });

  it("keeps prior entries in order", () => {
    const history = appendHistory([entry("1+1", "2")], entry("3*4", "12"));
    expect(history).toEqual([entry("1+1", "2"), entry("3*4", "12")]);
  });

  it("drops the oldest entry past the limit", () => {
    const start = [entry("a", "1"), entry("b", "2"), entry("c", "3")];
    expect(appendHistory(start, entry("d", "4"), 3)).toEqual([
      entry("b", "2"),
      entry("c", "3"),
      entry("d", "4"),
    ]);
  });
});
