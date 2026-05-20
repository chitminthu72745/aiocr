import type { UploadPdfResponse } from "./types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function firstObject(v: unknown): Record<string, unknown> | null {
  if (isRecord(v)) return v;
  if (Array.isArray(v) && v.length > 0 && isRecord(v[0])) return v[0];
  return null;
}

export function getByPath(obj: unknown, path: string): unknown {
  if (obj == null) return undefined;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null) return undefined;
    if (Array.isArray(cur)) {
      const idx = Number.isInteger(+part) ? +part : 0;
      cur = cur[idx as number];
      continue;
    }
    if (typeof cur === "object") {
      const rec = cur as Record<string, unknown>;
      cur = rec[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

/**
 * Extracts a value from the API JSON response using common field names.
 * Checks data, data.data, and nested objects. Adapt keys to match your API.
 */
export function bindValue(
  data: UploadPdfResponse | null | undefined,
  keys: string[]
): string {
  if (!data) return "";
  const base0 = firstObject(data);
  if (!base0) return "";

  const candidates: Array<Record<string, unknown>> = [];
  const push = (v: unknown) => {
    const obj = firstObject(v);
    if (obj) candidates.push(obj);
  };

  push(base0);
  push(base0.data);
  push((base0 as any).result);
  push((base0 as any).output);

  for (const key of keys) {
    for (const src of candidates) {
      const v = getByPath(src, key);
      if (v != null && typeof v === "string") return v;
      if (v != null && typeof v === "number") return String(v);
      if (v != null && typeof v === "boolean") return String(v);
    }
  }
  return "";
}
