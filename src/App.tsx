import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPdf } from "./uploadPdf";
import type { UploadPdfResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "http://localhost:5678");

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<UploadPdfResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [jsonEditOpen, setJsonEditOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const navigate = useNavigate();

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await uploadPdf(file, { baseUrl: API_BASE });
      setData(result);
      try {
        sessionStorage.setItem("uploadData", JSON.stringify(result));
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }, [file]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") {
      setFile(f);
      setError(null);
    } else {
      setError("Please select a PDF file");
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
        if (raw) setData(JSON.parse(raw));
      } catch {}
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      try {
        setJsonText(JSON.stringify(data, null, 2));
      } catch {}
    }
  }, [data]);

  const saveEditedJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setData(parsed);
      sessionStorage.setItem("uploadData", JSON.stringify(parsed));
      setError(null);
      setJsonEditOpen(false);
    } catch (e) {
      setError("Invalid JSON format");
    }
  }, [jsonText]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>PDF Upload</h1>
      <p style={styles.subtitle}>POST /webhook-test/upload_pdf</p>

      <div
        style={{
          ...styles.dropzone,
          ...(drag ? styles.dropzoneDrag : {}),
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={onFileChange}
          style={styles.input}
        />
        {file ? (
          <p style={styles.fileName}>{file.name}</p>
        ) : (
          <p style={styles.hint}>Drop a PDF here or click to browse</p>
        )}
      </div>

      <button
        style={{
          ...styles.button,
          opacity: !file || loading ? 0.5 : 1,
          cursor: !file || loading ? "not-allowed" : "pointer",
        }}
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? "Uploading…" : "Upload"}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {data && (
        <>
          <div style={styles.result}>
            <h2 style={styles.resultTitle}>Response JSON</h2>
            {!jsonEditOpen ? (
              <>
                <pre style={styles.pre}>{JSON.stringify(data, null, 2)}</pre>
                <button
                  style={{ ...styles.button, marginTop: 12, background: "#64748b", color: "#fff" }}
                  onClick={() => setJsonEditOpen(true)}
                >
                  Edit JSON
                </button>
              </>
            ) : (
              <>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 220,
                    background: "#0b1220",
                    color: "#e2e8f0",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: 12,
                    fontFamily: "ui-monospace, Menlo, Consolas, monospace",
                    fontSize: 13,
                  }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    style={{ ...styles.button, background: "#22c55e", color: "#0f172a", width: "auto", padding: "10px 16px" }}
                    onClick={saveEditedJson}
                  >
                    Save JSON
                  </button>
                  <button
                    style={{ ...styles.button, background: "#ef4444", color: "#fff", width: "auto", padding: "10px 16px" }}
                    onClick={() => {
                      setJsonEditOpen(false);
                      setJsonText(JSON.stringify(data, null, 2));
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            style={{
              ...styles.button,
              marginTop: 12,
              background: "#22c55e",
              color: "#0f172a",
            }}
            onClick={() => navigate("/print", { state: { data } })}
          >
            Proceed to Print
          </button>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
