import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { UploadPdfResponse } from "./types";
import FiveThreePrint from "./FiveThreePrint";

export default function PrintPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialFromState = (location.state as { data?: UploadPdfResponse } | null)?.data ?? null;
  const [data, setData] = useState<UploadPdfResponse | null>(initialFromState);

  useEffect(() => {
    if (initialFromState) {
      try {
        sessionStorage.setItem("uploadData", JSON.stringify(initialFromState));
      } catch {}
    }
  }, [initialFromState]);

  useEffect(() => {
    if (!data) {
      try {
        const raw = sessionStorage.getItem("uploadData");
        if (raw) setData(JSON.parse(raw));
      } catch {}
    }
  }, [data]);

  const hasData = useMemo(() => !!data, [data]);

  if (!hasData) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
        <p>No data found for printing.</p>
        <button
          style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #cbd5e1", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Back to Upload
        </button>
      </div>
    );
  }

  return <FiveThreePrint data={data} />;
}
