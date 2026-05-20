import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPdf } from "./uploadPdf";
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "http://localhost:3000");
const safeStringify = (obj) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === "bigint")
            return value.toString();
        if (value instanceof Date)
            return value.toISOString();
        if (typeof value === "symbol")
            return value.toString();
        if (typeof value === "function")
            return undefined;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            if (seen.has(value))
                return "[Circular]";
            seen.add(value);
        }
        return value;
    });
};
const safeJsonParse = (text) => {
    return JSON.parse(text, (_key, value) => {
        if (typeof value === "string") {
            const bigIntMatch = value.match(/^(\d+)n$/);
            if (bigIntMatch)
                return BigInt(bigIntMatch[1]);
        }
        return value;
    });
};
export default function App() {
    const [file, setFile] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [drag, setDrag] = useState(false);
    const [jsonEditOpen, setJsonEditOpen] = useState(false);
    const [jsonText, setJsonText] = useState("");
    const navigate = useNavigate();
    const handleUpload = useCallback(async () => {
        if (!file)
            return;
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const result = await uploadPdf(file, { baseUrl: API_BASE });
            setData(result);
            try {
                sessionStorage.setItem("uploadData", safeStringify(result));
            }
            catch (e) {
                console.error("Failed to save to sessionStorage:", e);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        }
        finally {
            setLoading(false);
        }
    }, [file]);
    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f?.type === "application/pdf") {
            setFile(f);
            setError(null);
        }
        else {
            setError("Please select a PDF file");
        }
    }, []);
    const onDragOver = useCallback((e) => {
        e.preventDefault();
        setDrag(true);
    }, []);
    const onDragLeave = useCallback((e) => {
        e.preventDefault();
        setDrag(false);
    }, []);
    const onFileChange = useCallback((e) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setError(null);
        }
        e.target.value = "";
    }, []);
    useEffect(() => {
        if (!data) {
            try {
                const raw = sessionStorage.getItem("uploadData");
                if (raw)
                    setData(safeJsonParse(raw));
            }
            catch { }
        }
    }, [data]);
    useEffect(() => {
        if (data) {
            try {
                setJsonText(safeStringify(data));
            }
            catch { }
        }
    }, [data]);
    const saveEditedJson = useCallback(() => {
        try {
            const parsed = safeJsonParse(jsonText);
            setData(parsed);
            sessionStorage.setItem("uploadData", safeStringify(parsed));
            setError(null);
            setJsonEditOpen(false);
        }
        catch (e) {
            setError("Invalid JSON format");
        }
    }, [jsonText]);
    return (_jsxs("div", { style: styles.container, children: [_jsx("h1", { style: styles.title, children: "PDF Upload" }), _jsx("p", { style: styles.subtitle, children: "POST /api/ocr/proposal" }), _jsxs("div", { style: {
                    ...styles.dropzone,
                    ...(drag ? styles.dropzoneDrag : {}),
                }, onDrop: onDrop, onDragOver: onDragOver, onDragLeave: onDragLeave, children: [_jsx("input", { type: "file", accept: ".pdf,application/pdf", onChange: onFileChange, style: styles.input }), file ? (_jsx("p", { style: styles.fileName, children: file.name })) : (_jsx("p", { style: styles.hint, children: "Drop a PDF here or click to browse" }))] }), _jsx("button", { style: {
                    ...styles.button,
                    opacity: !file || loading ? 0.5 : 1,
                    cursor: !file || loading ? "not-allowed" : "pointer",
                }, onClick: handleUpload, disabled: !file || loading, children: loading ? "Uploading…" : "Upload" }), error && _jsx("p", { style: styles.error, children: error }), data && (_jsxs(_Fragment, { children: [_jsxs("div", { style: styles.result, children: [_jsx("h2", { style: styles.resultTitle, children: "Response JSON" }), !jsonEditOpen ? (_jsxs(_Fragment, { children: [_jsx("pre", { style: styles.pre, children: JSON.stringify(data, null, 2) }), _jsx("button", { style: { ...styles.button, marginTop: 12, background: "#64748b", color: "#fff" }, onClick: () => setJsonEditOpen(true), children: "Edit JSON" })] })) : (_jsxs(_Fragment, { children: [_jsx("textarea", { value: jsonText, onChange: (e) => setJsonText(e.target.value), style: {
                                            width: "100%",
                                            minHeight: 220,
                                            background: "#0b1220",
                                            color: "#e2e8f0",
                                            border: "1px solid #334155",
                                            borderRadius: 8,
                                            padding: 12,
                                            fontFamily: "ui-monospace, Menlo, Consolas, monospace",
                                            fontSize: 13,
                                        } }), _jsxs("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [_jsx("button", { style: { ...styles.button, background: "#22c55e", color: "#0f172a", width: "auto", padding: "10px 16px" }, onClick: saveEditedJson, children: "Save JSON" }), _jsx("button", { style: { ...styles.button, background: "#ef4444", color: "#fff", width: "auto", padding: "10px 16px" }, onClick: () => {
                                                    setJsonEditOpen(false);
                                                    setJsonText(safeStringify(data));
                                                }, children: "Cancel" })] })] }))] }), _jsx("button", { style: {
                            ...styles.button,
                            marginTop: 12,
                            background: "#22c55e",
                            color: "#0f172a",
                        }, onClick: () => navigate("/print", { state: { data } }), children: "Proceed to Print" })] }))] }));
}
const styles = {
    container: {
        maxWidth: 560,
        margin: "0 auto",
        padding: 48,
    },
    title: {
        fontSize: 28,
        fontWeight: 600,
        marginBottom: 4,
    },
    subtitle: {
        color: "#94a3b8",
        fontSize: 14,
        marginBottom: 32,
    },
    dropzone: {
        border: "2px dashed #475569",
        borderRadius: 12,
        padding: 40,
        textAlign: "center",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
        background: "#1e293b",
    },
    dropzoneDrag: {
        borderColor: "#38bdf8",
        background: "rgba(56, 189, 248, 0.08)",
    },
    input: {
        display: "none",
    },
    hint: {
        color: "#94a3b8",
        margin: 0,
    },
    fileName: {
        color: "#38bdf8",
        margin: 0,
        fontWeight: 500,
    },
    button: {
        marginTop: 24,
        width: "100%",
        padding: "12px 24px",
        fontSize: 16,
        fontWeight: 600,
        color: "#0f172a",
        background: "#38bdf8",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
    },
    error: {
        marginTop: 16,
        color: "#f87171",
    },
    result: {
        marginTop: 32,
        padding: 24,
        background: "#1e293b",
        borderRadius: 12,
        overflow: "auto",
    },
    resultTitle: {
        fontSize: 16,
        marginBottom: 12,
        color: "#e2e8f0",
    },
    pre: {
        margin: 0,
        fontSize: 13,
        color: "#94a3b8",
    },
};
