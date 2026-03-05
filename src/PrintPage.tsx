import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { UploadPdfResponse } from "./types";
import FiveThreePrint from "./FiveThreePrint";

function get(obj: any, path: string, fallback: any = ""): any {
  try {
    return path.split(".").reduce((o, k) => (o?.[k] ?? undefined), obj) ?? fallback;
  } catch {
    return fallback;
  }
}

function set(obj: any, path: string, value: any) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] == null || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

export default function PrintPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialFromState = (location.state as { data?: UploadPdfResponse } | null)?.data ?? null;
  const [data, setData] = useState<UploadPdfResponse | null>(initialFromState);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    if (initialFromState) {
      try {
        sessionStorage.setItem("uploadData", JSON.stringify(initialFromState));
      } catch { }
    }
  }, [initialFromState]);

  useEffect(() => {
    if (!data) {
      try {
        const raw = sessionStorage.getItem("uploadData");
        if (raw) setData(JSON.parse(raw));
      } catch { }
    }
  }, [data]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("uploadData");
      if (raw) setData(JSON.parse(raw));
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasData = useMemo(() => !!data, [data]);
  const root: any = useMemo(() => (Array.isArray(data) ? data[0] : data), [data]);
  const bene: any[] = useMemo(() => {
    const b = root?.data?.beneficiaries ?? root?.beneficiaries;
    return Array.isArray(b) ? b : [];
  }, [root]);

  const startEdit = () => {
    const snapshot = JSON.parse(JSON.stringify(root ?? {}));
    setDraft(snapshot);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!data) return;
    const updated = Array.isArray(data) ? [{ ...draft }] : { ...draft };
    setData(updated as any);
    try {
      sessionStorage.setItem("uploadData", JSON.stringify(updated));
    } catch { }
    setEditing(false);
  };

  const renderData = useMemo(() => {
    if (editing && draft) {
      return Array.isArray(data) ? [{ ...draft }] : draft;
    }
    return data;
  }, [editing, draft, data]);

  const onField = (path: string) => ({
    value: get(draft, path, ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setDraft((prev: any) => {
        const next = JSON.parse(JSON.stringify(prev));
        set(next, path, v);
        return next;
      });
    },
  });

  const ensureBeneRows = (rows: number) => {
    setDraft((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      const arr: any[] = Array.isArray(next?.data?.beneficiaries)
        ? next.data.beneficiaries
        : Array.isArray(next?.beneficiaries)
          ? next.beneficiaries
          : (next.data = { ...(next.data || {}), beneficiaries: [] }, next.data.beneficiaries);
      while (arr.length < rows) arr.push({ name: "", nrc_number: "", relationship: "", percentage: "" });
      return next;
    });
  };
  const ensureArray = (path: string, rows: number, factory: () => any) => {
    setDraft((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let cur = next as any;
      for (let i = 0; i < parts.length; i++) {
        const k = parts[i];
        if (i === parts.length - 1) {
          if (!Array.isArray(cur[k])) cur[k] = [];
          while (cur[k].length < rows) cur[k].push(factory());
        } else {
          if (cur[k] == null || typeof cur[k] !== "object") cur[k] = {};
          cur = cur[k];
        }
      }
      return next;
    });
  };
  const removeArrayIndex = (path: string, index: number) => {
    setDraft((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let cur = next as any;
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        cur = cur?.[k];
        if (!cur) return next;
      }
      const key = parts[parts.length - 1];
      if (Array.isArray(cur?.[key])) {
        cur[key] = cur[key].filter((_: any, idx: number) => idx !== index);
      }
      return next;
    });
  };

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

  return (
    <div>
      <div className="no-print" style={{ position: "fixed", top: 12, left: 12, zIndex: 20, display: "flex", gap: 8 }}>
        <button
          onClick={() => {
            if (editing) {
              saveEdit();
              setTimeout(() => window.print(), 50);
            } else {
              window.print();
            }
          }}
          style={{ padding: "8px 12px", border: "1px solid #94a3b8", borderRadius: 6, background: "#fff", cursor: "pointer" }}
        >
          Print
        </button>
        {!editing && (
          <button
            onClick={startEdit}
            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", cursor: "pointer" }}
          >
            Review & Edit
          </button>
        )}
        {editing && (
          <>
            <button
              onClick={saveEdit}
              style={{ padding: "8px 12px", border: "1px solid #22c55e", borderRadius: 6, background: "#22c55e", color: "#0f172a", cursor: "pointer" }}
            >
              Save & Apply
            </button>
            <button
              onClick={cancelEdit}
              style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", cursor: "pointer" }}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {editing && (
        <div
          style={{
            position: "fixed",
            top: 56,
            left: 12,
            right: 12,
            bottom: 12,
            zIndex: 15,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
            overflow: "auto",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Review & Edit – All Fields</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }}>
            <section style={card(12)}>
              <h4 style={cardTitle}>Summary</h4>
              <div style={grid2}>
                <label><span>Policy No</span><input style={fld} {...onField("policy_no")} /></label>
                <label><span>Proposal No (top)</span><input style={fld} {...onField("proposal_no")} /></label>
                <label><span>Agent Name</span><input style={fld} {...onField("data.agent_name")} /></label>
              </div>
            </section>

            <section style={card(12)}>
              <h4 style={cardTitle}>Insured</h4>
              <div style={grid3}>
                <label><span>Name</span><input style={fld} {...onField("data.insured.name")} /></label>
                <label><span>Father Name</span><input style={fld} {...onField("data.insured.father_name")} /></label>
                <label><span>NRC/FRC/Passport</span><input style={fld} {...onField("data.insured.nrc_frc_passport")} /></label>
                <label><span>Date of Birth</span><input style={fld} {...onField("data.insured.dob")} /></label>
                <label><span>Age Next Birthday</span><input style={fld} {...onField("data.insured.age_next_birthday")} /></label>
                <label><span>Insurance Term (years)</span><input style={fld} {...onField("data.insured.insurance_term_years")} /></label>
                <label><span>Occupation</span><input style={fld} {...onField("data.insured.occupation")} /></label>
                <label><span>Address</span><input style={fld} {...onField("data.insured.address")} /></label>
                <label><span>Initial Sum Assured (MMK)</span><input style={fld} {...onField("data.insured.initial_sum_assured_mmk")} /></label>
                <label><span>Premium</span><input style={fld} {...onField("data.insured.premium")} /></label>
                <label><span>Mode of Payment</span><input style={fld} {...onField("data.insured.mode_of_payment")} /></label>
                <label style={{ gridColumn: "1 / span 3" }}><span>Address</span><textarea style={{ ...fld, height: 60 }} {...onField("data.insured.address")} /></label>
                <label><span>Phone</span><input style={fld} {...onField("data.insured.phone")} /></label>
                <label><span>Email</span><input style={fld} {...onField("data.insured.email")} /></label>
                <label><span>Policy Start Date</span><input style={fld} {...onField("data.policyStartDate")} /></label>
                <label><span>Policy End Date</span><input style={fld} {...onField("data.policyEndDate")} /></label>
              </div>
            </section>

            <section style={card(12)}>
              <h4 style={cardTitle}>Premium Payer</h4>
              <div style={grid3}>
                <label><span>Name</span><input style={fld} {...onField("data.premium_payer.name")} /></label>
                <label><span>Occupation</span><input style={fld} {...onField("data.premium_payer.occupation")} /></label>
                <label><span>Company Name</span><input style={fld} {...onField("data.premium_payer.company_name")} /></label>
                <label><span>Industry Sector</span><input style={fld} {...onField("data.premium_payer.industry_sector")} /></label>
                <label><span>Income</span><input style={fld} {...onField("data.premium_payer.income")} /></label>
                <label><span>Relation to Insured</span><input style={fld} {...onField("data.premium_payer.relation_to_insured")} /></label>
              </div>
            </section>

            <section style={card(12)}>
              <h4 style={cardTitle}>Friend Contact</h4>
              <div style={grid3}>
                <label><span>Name</span><input style={fld} {...onField("data.friend_contact.name")} /></label>
                <label><span>Relationship</span><input style={fld} {...onField("data.friend_contact.relationship")} /></label>
                <label><span>Years Known</span><input style={fld} {...onField("data.friend_contact.years_known")} /></label>
                <label style={{ gridColumn: "1 / span 3" }}><span>Address</span><textarea style={{ ...fld, height: 60 }} {...onField("data.friend_contact.address")} /></label>
                <label><span>Phone</span><input style={fld} {...onField("data.friend_contact.phone")} /></label>
                <label><span>Email</span><input style={fld} {...onField("data.friend_contact.email")} /></label>
              </div>
            </section>

            <section style={card(12)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={cardTitle}>Existing Policies</h4>
                <div>
                  <button
                    onClick={() => ensureArray("data.existing_policies", (draft?.data?.existing_policies?.length ?? 0) + 1, () => ({
                      company_name: "",
                      type_of_product_policy_no: "",
                      sum_assured: "",
                      policy_start_date_current_conditions: "",
                      normal_premium_rate_additional_rate: "",
                      full_year_reduced_year: "",
                      date_if_policy_lapsed: "",
                    }))}
                    style={smallBtn}
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12 }}>
                {(Array.isArray(draft?.data?.existing_policies) ? draft.data.existing_policies : []).map((_: any, i: number) => (
                  <div key={i} style={{ gridColumn: "1 / span 12", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <strong>Policy #{i + 1}</strong>
                      <button onClick={() => removeArrayIndex("data.existing_policies", i)} style={smallBtn}>Remove</button>
                    </div>
                    <div style={grid3}>
                      <label><span>Company</span><input style={fld} {...onField(`data.existing_policies.${i}.company_name`)} /></label>
                      <label><span>Type / Policy No</span><input style={fld} {...onField(`data.existing_policies.${i}.type_of_product_policy_no`)} /></label>
                      <label><span>Sum Assured</span><input style={fld} {...onField(`data.existing_policies.${i}.sum_assured`)} /></label>
                      <label><span>Start Date / Conditions</span><input style={fld} {...onField(`data.existing_policies.${i}.policy_start_date_current_conditions`)} /></label>
                      <label><span>Normal Rate / Additional</span><input style={fld} {...onField(`data.existing_policies.${i}.normal_premium_rate_additional_rate`)} /></label>
                      <label><span>Full Year / Reduced</span><input style={fld} {...onField(`data.existing_policies.${i}.full_year_reduced_year`)} /></label>
                      <label><span>Lapsed Date</span><input style={fld} {...onField(`data.existing_policies.${i}.date_if_policy_lapsed`)} /></label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={card(12)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={cardTitle}>Beneficiaries</h4>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => {
                    const draftBeneLen = (draft?.data?.beneficiaries ?? draft?.beneficiaries ?? []).length;
                    ensureBeneRows((draftBeneLen || 0) + 1);
                  }} style={smallBtn}>+ Add</button>
                  <button onClick={() => ensureBeneRows(4)} style={smallBtn}>Ensure 4 Rows</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 1fr 120px 80px", gap: 8 }}>
                {(() => {
                  const draftBene = draft?.data?.beneficiaries ?? draft?.beneficiaries ?? [];
                  const rows = draftBene.length ? draftBene : [{}, {}, {}, {}];
                  return rows.slice(0, Math.max(4, draftBene.length || 0)).map((_: any, i: number) => (
                    <div key={i} style={{ display: "contents" }}>
                      <div style={{ alignSelf: "center" }}>{i + 1}</div>
                      <input style={fld} {...onField(`data.beneficiaries.${i}.name`)} placeholder="Name" />
                      <input style={fld} {...onField(`data.beneficiaries.${i}.nrc_number`)} placeholder="NRC Number" />
                      <input style={fld} {...onField(`data.beneficiaries.${i}.relationship`)} placeholder="Relationship" />
                      <input style={fld} {...onField(`data.beneficiaries.${i}.percentage`)} placeholder="%" />
                      <button onClick={() => removeArrayIndex("data.beneficiaries", i)} style={smallBtn}>Remove</button>
                    </div>
                  ));
                })()}
              </div>
            </section>

            <section style={card(12)}>
              <h4 style={cardTitle}>Bank Info</h4>
              <div style={grid3}>
                <label><span>Account Name</span><input style={fld} {...onField("data.bank_info.bank_account_name")} /></label>
                <label><span>Account Number</span><input style={fld} {...onField("data.bank_info.bank_account_number")} /></label>
                <label><span>Branch Name</span><input style={fld} {...onField("data.bank_info.bank_branch_name")} /></label>
                <label><span>Branch Code</span><input style={fld} {...onField("data.bank_info.bank_branch_code")} /></label>
              </div>
            </section>

            <section style={card(12)}>
              <h4 style={cardTitle}>Acknowledgment</h4>
              <div style={grid3}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!get(draft, "data.acknowledgment.accepted", false)}
                    onChange={(e) =>
                      setDraft((prev: any) => {
                        const next = JSON.parse(JSON.stringify(prev));
                        set(next, "data.acknowledgment.accepted", e.target.checked);
                        return next;
                      })
                    }
                  />
                  <span>Accepted</span>
                </label>
                <label><span>Signature Date</span><input style={fld} {...onField("data.acknowledgment.signature_date")} /></label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!get(draft, "data.acknowledgment.signature_handwritten", false)}
                    onChange={(e) =>
                      setDraft((prev: any) => {
                        const next = JSON.parse(JSON.stringify(prev));
                        set(next, "data.acknowledgment.signature_handwritten", e.target.checked);
                        return next;
                      })
                    }
                  />
                  <span>Signature Handwritten</span>
                </label>
              </div>
            </section>
          </div>
        </div>
      )}

      <FiveThreePrint data={renderData} />
    </div>
  );
}

const fld: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  outline: "none",
};
const card = (span: number): React.CSSProperties => ({
  gridColumn: `span ${span}`,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 12,
});
const cardTitle: React.CSSProperties = {
  margin: 0,
  marginBottom: 8,
};
const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};
const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 12,
};
const smallBtn: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
};
