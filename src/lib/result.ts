// Discriminated union for server actions and route handlers.
// Usage:
//   return { ok: true, data: ... }
//   return { ok: false, error: "some_code" }

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<T>(error: string): Result<T> {
  return { ok: false, error };
}
