function isRecord(v) {
    return v != null && typeof v === "object" && !Array.isArray(v);
}
function firstObject(v) {
    if (isRecord(v))
        return v;
    if (Array.isArray(v) && v.length > 0 && isRecord(v[0]))
        return v[0];
    return null;
}
export function getByPath(obj, path) {
    if (obj == null)
        return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const part of parts) {
        if (cur == null)
            return undefined;
        if (Array.isArray(cur)) {
            const idx = Number.isInteger(+part) ? +part : 0;
            cur = cur[idx];
            continue;
        }
        if (typeof cur === "object") {
            const rec = cur;
            cur = rec[part];
        }
        else {
            return undefined;
        }
    }
    return cur;
}
/**
 * Extracts a value from the API JSON response using common field names.
 * Checks data, data.data, and nested objects. Adapt keys to match your API.
 */
export function bindValue(data, keys) {
    if (!data)
        return "";
    const base0 = firstObject(data);
    if (!base0)
        return "";
    const candidates = [];
    const push = (v) => {
        const obj = firstObject(v);
        if (obj)
            candidates.push(obj);
    };
    push(base0);
    push(base0.data);
    push(base0.result);
    push(base0.output);
    for (const key of keys) {
        for (const src of candidates) {
            const v = getByPath(src, key);
            if (v != null && typeof v === "string")
                return v;
            if (v != null && typeof v === "number")
                return String(v);
            if (v != null && typeof v === "boolean")
                return String(v);
        }
    }
    return "";
}
