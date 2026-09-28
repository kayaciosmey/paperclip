export type HistoryEntry = {
  expression: string;
  result: string;
};

export const HISTORY_LIMIT = 12;

export function appendHistory(
  history: readonly HistoryEntry[],
  entry: HistoryEntry,
  limit = HISTORY_LIMIT,
): HistoryEntry[] {
  const next = [...history, entry];
  if (next.length <= limit) return next;
  return next.slice(next.length - limit);
}
