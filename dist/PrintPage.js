import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FiveThreePrint from "./FiveThreePrint";
export default function PrintPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const initialFromState = location.state?.data ?? null;
    const [data, setData] = useState(initialFromState);
    useEffect(() => {
        if (initialFromState) {
            try {
                sessionStorage.setItem("uploadData", JSON.stringify(initialFromState));
            }
            catch { }
        }
    }, [initialFromState]);
    useEffect(() => {
        if (!data) {
            try {
                const raw = sessionStorage.getItem("uploadData");
                if (raw)
                    setData(JSON.parse(raw));
            }
            catch { }
        }
    }, [data]);
    const hasData = useMemo(() => !!data, [data]);
    if (!hasData) {
        return (_jsxs("div", { style: { maxWidth: 560, margin: "0 auto", padding: 24 }, children: [_jsx("p", { children: "No data found for printing." }), _jsx("button", { style: { padding: "10px 16px", borderRadius: 8, border: "1px solid #cbd5e1", cursor: "pointer" }, onClick: () => navigate("/"), children: "Back to Upload" })] }));
    }
    return _jsx(FiveThreePrint, { data: data });
}
