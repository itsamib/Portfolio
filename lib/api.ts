import { CalculationInput, CalculationResponse } from "./types";

/**
 * Calls the Python serverless function (`api/index.py`) which performs
 * all portfolio calculations with pandas. Throws on non-200 responses.
 */
export async function calculatePortfolio(
  records: CalculationInput[]
): Promise<CalculationResponse> {
  if (records.length === 0) {
    return { records: [], summary: [] };
  }

  const res = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(records),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Calculation request failed (${res.status}): ${text || res.statusText}`
    );
  }

  return res.json();
}
