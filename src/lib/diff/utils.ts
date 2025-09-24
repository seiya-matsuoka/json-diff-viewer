export const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const isEqualNumber = (a: unknown, b: unknown, eps: number) =>
  typeof a === "number" && typeof b === "number"
    ? Math.abs(a - b) <= eps
    : false;
