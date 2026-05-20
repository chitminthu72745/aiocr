import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FiveThreePrint from "./FiveThreePrint";
import { bindValue } from "./bindData";
function get(obj, path, fallback = "") {
    try {
        return path.split(".").reduce((o, k) => (o?.[k] ?? undefined), obj) ?? fallback;
    }
    catch {
        return fallback;
    }
}
function set(obj, path, value) {
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        const nextK = parts[i + 1];
        const isNextNumeric = !isNaN(Number(nextK));
        if (cur[k] == null || typeof cur[k] !== "object") {
            cur[k] = isNextNumeric ? [] : {};
        }
        cur = cur[k];
    }
    cur[parts[parts.length - 1]] = value;
}
export default function PrintPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const initialFromState = location.state?.data ?? null;
    const [data, setData] = useState(initialFromState);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(null);
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
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("uploadData");
            if (raw)
                setData(JSON.parse(raw));
        }
        catch { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const hasData = useMemo(() => !!data, [data]);
    const root = useMemo(() => (Array.isArray(data) ? data[0] : data), [data]);
    const bene = useMemo(() => {
        const b = root?.data?.beneficiaries ?? root?.beneficiaries;
        return Array.isArray(b) ? b : [];
    }, [root]);
    const startEdit = () => {
        const snapshot = JSON.parse(JSON.stringify(root ?? {}));
        // Pre-populate missing fields using bindValue logic for better OCR data binding
        const mappings = [
            { path: "proposal_no", keys: ["proposal_no", "proposalNumber"] },
            { path: "policy_no", keys: ["policy_no", "policyNumber", "policy_id", "policyId"] },
            { path: "receipt_no", keys: ["receipt_no", "invoice_no", "receiptNumber", "invoiceNumber"] },
            { path: "date", keys: ["date", "issued_at", "issue_date", "created_at"] },
            { path: "agent_name", keys: ["agent_name"] },
            { path: "data.agent_name", keys: ["data.agent_name", "agent_name", "agentId", "agent_id"] },
            { path: "data.insured.name", keys: ["data.insured.name", "insured.name", "insured_name", "applicant_name", "customer_name", "name"] },
            { path: "data.insured.father_name", keys: ["insured.father_name", "father_name"] },
            { path: "data.insured.nrc_frc_passport", keys: ["insured.nrc_frc_passport", "nrc", "nrc_no", "nrcNumber", "frc", "passport"] },
            { path: "data.insured.dob", keys: ["insured.dob", "dob", "date_of_birth"] },
            { path: "data.insured.age_next_birthday", keys: ["insured.age_next_birthday", "age_next_birthday", "age", "ageNBD"] },
            { path: "data.insured.insurance_term_years", keys: ["insured.insurance_term_years", "insured.term_of_insurance", "term_of_insurance"] },
            { path: "data.insured.occupation", keys: ["insured.occupation", "occupation", "job", "profession"] },
            { path: "data.insured.address", keys: ["insured.address", "address", "residential_address", "home_address"] },
            { path: "data.insured.phone", keys: ["insured.phone", "phone"] },
            { path: "data.insured.email", keys: ["insured.email", "email"] },
            { path: "data.insured.initial_sum_assured_mmk", keys: ["insured.initial_sum_assured_mmk"] },
            { path: "data.insured.premium", keys: ["insured.premium"] },
            { path: "data.insured.mode_of_payment", keys: ["insured.mode_of_payment"] },
            { path: "data.insured.height_cm", keys: ["insured.height_cm", "height_cm"] },
            { path: "data.insured.weight_kg", keys: ["insured.weight_kg", "weight_kg"] },
            { path: "data.insured.is_smoker", keys: ["insured.is_smoker", "is_smoker"] },
            { path: "data.insured.health_history", keys: ["insured.health_history", "health_history"] },
            { path: "data.policyStartDate", keys: ["policyStartDate"] },
            { path: "data.policyEndDate", keys: ["policyEndDate"] },
            { path: "data.premium_payer.name", keys: ["premium_payer.name"] },
            { path: "data.premium_payer.occupation", keys: ["premium_payer.occupation"] },
            { path: "data.premium_payer.company_name", keys: ["premium_payer.company_name"] },
            { path: "data.premium_payer.industry_sector", keys: ["premium_payer.industry_sector"] },
            { path: "data.premium_payer.income", keys: ["premium_payer.income"] },
            { path: "data.premium_payer.relation_to_insured", keys: ["premium_payer.relation_to_insured"] },
            { path: "data.bank_info.bank_account_name", keys: ["bank_account_name", "account_name"] },
            { path: "data.bank_info.bank_account_number", keys: ["bank_account_number", "account_number"] },
            { path: "data.bank_info.bank_branch_name", keys: ["bank_branch_name", "branch_name"] },
            { path: "data.bank_info.bank_branch_code", keys: ["bank_branch_code", "branch_code"] },
            { path: "personal_sataement", keys: ["personal_sataement", "personal_statement"] },
        ];
        mappings.forEach(m => {
            const currentVal = get(snapshot, m.path);
            if (!currentVal || currentVal === "") {
                const bestVal = bindValue(data, m.keys);
                if (bestVal) {
                    set(snapshot, m.path, bestVal);
                }
            }
        });
        // Normalize beneficiaries to always be under data.beneficiaries for consistent editing
        const rawBene = snapshot.data?.beneficiaries ?? snapshot.beneficiaries;
        if (Array.isArray(rawBene)) {
            if (!snapshot.data)
                snapshot.data = {};
            snapshot.data.beneficiaries = rawBene.map((b) => ({
                ...b,
                nrc_number: b.nrc_number ?? b.nrc ?? "",
                relationship: b.relationship ?? b.relation ?? "",
            }));
            delete snapshot.beneficiaries;
        }
        // Normalize existing policies
        const rawPolicies = snapshot.data?.existing_policies ?? snapshot.existing_policies;
        if (Array.isArray(rawPolicies)) {
            if (!snapshot.data)
                snapshot.data = {};
            snapshot.data.existing_policies = rawPolicies;
            delete snapshot.existing_policies;
        }
        // Normalize friend contact
        const rawFriend = snapshot.data?.friend_contact ?? snapshot.friend_contact;
        if (rawFriend && typeof rawFriend === "object" && !Array.isArray(rawFriend)) {
            if (!snapshot.data)
                snapshot.data = {};
            snapshot.data.friend_contact = rawFriend;
            delete snapshot.friend_contact;
        }
        // Normalize personal statement typo
        const rawPS = snapshot.personal_sataement ?? snapshot.personal_statement;
        if (Array.isArray(rawPS)) {
            snapshot.personal_sataement = rawPS;
            delete snapshot.personal_statement;
        }
        setDraft(snapshot);
        setEditing(true);
    };
    const cancelEdit = () => {
        setEditing(false);
        setDraft(null);
    };
    const saveEdit = () => {
        if (!data)
            return;
        const updated = Array.isArray(data) ? [{ ...draft }] : { ...draft };
        setData(updated);
        try {
            sessionStorage.setItem("uploadData", JSON.stringify(updated));
        }
        catch { }
        setEditing(false);
    };
    const renderData = useMemo(() => {
        if (editing && draft) {
            return Array.isArray(data) ? [{ ...draft }] : draft;
        }
        return data;
    }, [editing, draft, data]);
    const onField = (path) => ({
        value: get(draft, path, ""),
        onChange: (e) => {
            const v = e.target.value;
            setDraft((prev) => {
                const next = JSON.parse(JSON.stringify(prev));
                set(next, path, v);
                return next;
            });
        },
    });
    const ensureBeneRows = (rows) => {
        setDraft((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            if (!next.data)
                next.data = {};
            if (!Array.isArray(next.data.beneficiaries))
                next.data.beneficiaries = [];
            const arr = next.data.beneficiaries;
            while (arr.length < rows)
                arr.push({ name: "", nrc_number: "", relationship: "", percentage: "" });
            return next;
        });
    };
    const ensureArray = (path, rows, factory) => {
        setDraft((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            const parts = path.split(".");
            let cur = next;
            for (let i = 0; i < parts.length; i++) {
                const k = parts[i];
                if (i === parts.length - 1) {
                    if (!Array.isArray(cur[k]))
                        cur[k] = [];
                    while (cur[k].length < rows)
                        cur[k].push(factory());
                }
                else {
                    if (cur[k] == null || typeof cur[k] !== "object")
                        cur[k] = {};
                    cur = cur[k];
                }
            }
            return next;
        });
    };
    const removeArrayIndex = (path, index) => {
        setDraft((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            const parts = path.split(".");
            let cur = next;
            for (let i = 0; i < parts.length - 1; i++) {
                const k = parts[i];
                cur = cur?.[k];
                if (!cur)
                    return next;
            }
            const key = parts[parts.length - 1];
            if (Array.isArray(cur?.[key])) {
                cur[key] = cur[key].filter((_, idx) => idx !== index);
            }
            return next;
        });
    };
    if (!hasData) {
        return (_jsxs("div", { style: { maxWidth: 560, margin: "0 auto", padding: 24 }, children: [_jsx("p", { children: "No data found for printing." }), _jsx("button", { style: { padding: "10px 16px", borderRadius: 8, border: "1px solid #cbd5e1", cursor: "pointer" }, onClick: () => navigate("/"), children: "Back to Upload" })] }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "no-print", style: { position: "fixed", top: 12, left: 12, zIndex: 20, display: "flex", gap: 8 }, children: [_jsx("button", { onClick: () => {
                            if (editing) {
                                saveEdit();
                                setTimeout(() => window.print(), 50);
                            }
                            else {
                                window.print();
                            }
                        }, style: { padding: "8px 12px", border: "1px solid #94a3b8", borderRadius: 6, background: "#fff", cursor: "pointer" }, children: "Print" }), !editing && (_jsx("button", { onClick: startEdit, style: { padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", cursor: "pointer" }, children: "Review & Edit" })), editing && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: saveEdit, style: { padding: "8px 12px", border: "1px solid #22c55e", borderRadius: 6, background: "#22c55e", color: "#0f172a", cursor: "pointer" }, children: "Save & Apply" }), _jsx("button", { onClick: cancelEdit, style: { padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", cursor: "pointer" }, children: "Cancel" })] }))] }), editing && (_jsxs("div", { style: {
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
                }, children: [_jsx("h3", { style: { marginTop: 0, marginBottom: 12 }, children: "Review & Edit \u2013 All Fields" }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }, children: [_jsxs("section", { style: card(12), children: [_jsx("h4", { style: cardTitle, children: "Summary" }), _jsxs("div", { style: grid2, children: [_jsxs("label", { children: [_jsx("span", { children: "Policy No" }), _jsx("input", { style: fld, ...onField("policy_no") })] }), _jsxs("label", { children: [_jsx("span", { children: "Proposal No (top)" }), _jsx("input", { style: fld, ...onField("proposal_no") })] }), _jsxs("label", { children: [_jsx("span", { children: "Receipt No" }), _jsx("input", { style: fld, ...onField("receipt_no") })] }), _jsxs("label", { children: [_jsx("span", { children: "Date" }), _jsx("input", { style: fld, ...onField("date") })] }), _jsxs("label", { children: [_jsx("span", { children: "Agent Name" }), _jsx("input", { style: fld, ...onField("data.agent_name") })] })] })] }), _jsxs("section", { style: card(12), children: [_jsx("h4", { style: cardTitle, children: "Insured" }), _jsxs("div", { style: grid3, children: [_jsxs("label", { children: [_jsx("span", { children: "Name" }), _jsx("input", { style: fld, ...onField("data.insured.name") })] }), _jsxs("label", { children: [_jsx("span", { children: "Father Name" }), _jsx("input", { style: fld, ...onField("data.insured.father_name") })] }), _jsxs("label", { children: [_jsx("span", { children: "NRC/FRC/Passport" }), _jsx("input", { style: fld, ...onField("data.insured.nrc_frc_passport") })] }), _jsxs("label", { children: [_jsx("span", { children: "Date of Birth" }), _jsx("input", { style: fld, ...onField("data.insured.dob") })] }), _jsxs("label", { children: [_jsx("span", { children: "Age Next Birthday" }), _jsx("input", { style: fld, ...onField("data.insured.age_next_birthday") })] }), _jsxs("label", { children: [_jsx("span", { children: "Insurance Term (years)" }), _jsx("input", { style: fld, ...onField("data.insured.insurance_term_years") })] }), _jsxs("label", { children: [_jsx("span", { children: "Occupation" }), _jsx("input", { style: fld, ...onField("data.insured.occupation") })] }), _jsxs("label", { children: [_jsx("span", { children: "Initial Sum Assured (MMK)" }), _jsx("input", { style: fld, ...onField("data.insured.initial_sum_assured_mmk") })] }), _jsxs("label", { children: [_jsx("span", { children: "Premium" }), _jsx("input", { style: fld, ...onField("data.insured.premium") })] }), _jsxs("label", { children: [_jsx("span", { children: "Mode of Payment" }), _jsx("input", { style: fld, ...onField("data.insured.mode_of_payment") })] }), _jsxs("label", { children: [_jsx("span", { children: "Height (cm)" }), _jsx("input", { style: fld, ...onField("data.insured.height_cm") })] }), _jsxs("label", { children: [_jsx("span", { children: "Weight (kg)" }), _jsx("input", { style: fld, ...onField("data.insured.weight_kg") })] }), _jsxs("label", { children: [_jsx("span", { children: "Is Smoker" }), _jsx("input", { style: fld, ...onField("data.insured.is_smoker") })] }), _jsxs("label", { style: { gridColumn: "1 / span 3" }, children: [_jsx("span", { children: "Health History" }), _jsx("textarea", { style: { ...fld, height: 60 }, ...onField("data.insured.health_history") })] }), _jsxs("label", { style: { gridColumn: "1 / span 3" }, children: [_jsx("span", { children: "Address" }), _jsx("textarea", { style: { ...fld, height: 60 }, ...onField("data.insured.address") })] }), _jsxs("label", { children: [_jsx("span", { children: "Phone" }), _jsx("input", { style: fld, ...onField("data.insured.phone") })] }), _jsxs("label", { children: [_jsx("span", { children: "Email" }), _jsx("input", { style: fld, ...onField("data.insured.email") })] }), _jsxs("label", { children: [_jsx("span", { children: "Policy Start Date" }), _jsx("input", { style: fld, ...onField("data.policyStartDate") })] }), _jsxs("label", { children: [_jsx("span", { children: "Policy End Date" }), _jsx("input", { style: fld, ...onField("data.policyEndDate") })] })] })] }), _jsxs("section", { style: card(12), children: [_jsx("h4", { style: cardTitle, children: "Premium Payer" }), _jsxs("div", { style: grid3, children: [_jsxs("label", { children: [_jsx("span", { children: "Name" }), _jsx("input", { style: fld, ...onField("data.premium_payer.name") })] }), _jsxs("label", { children: [_jsx("span", { children: "Occupation" }), _jsx("input", { style: fld, ...onField("data.premium_payer.occupation") })] }), _jsxs("label", { children: [_jsx("span", { children: "Company Name" }), _jsx("input", { style: fld, ...onField("data.premium_payer.company_name") })] }), _jsxs("label", { children: [_jsx("span", { children: "Industry Sector" }), _jsx("input", { style: fld, ...onField("data.premium_payer.industry_sector") })] }), _jsxs("label", { children: [_jsx("span", { children: "Income" }), _jsx("input", { style: fld, ...onField("data.premium_payer.income") })] }), _jsxs("label", { children: [_jsx("span", { children: "Relation to Insured" }), _jsx("input", { style: fld, ...onField("data.premium_payer.relation_to_insured") })] })] })] }), _jsxs("section", { style: card(12), children: [_jsx("h4", { style: cardTitle, children: "Friend Contact" }), _jsxs("div", { style: grid3, children: [_jsxs("label", { children: [_jsx("span", { children: "Name" }), _jsx("input", { style: fld, ...onField("data.friend_contact.name") })] }), _jsxs("label", { children: [_jsx("span", { children: "Relationship" }), _jsx("input", { style: fld, ...onField("data.friend_contact.relationship") })] }), _jsxs("label", { children: [_jsx("span", { children: "Years Known" }), _jsx("input", { style: fld, ...onField("data.friend_contact.years_known") })] }), _jsxs("label", { style: { gridColumn: "1 / span 3" }, children: [_jsx("span", { children: "Address" }), _jsx("textarea", { style: { ...fld, height: 60 }, ...onField("data.friend_contact.address") })] }), _jsxs("label", { children: [_jsx("span", { children: "Phone" }), _jsx("input", { style: fld, ...onField("data.friend_contact.phone") })] }), _jsxs("label", { children: [_jsx("span", { children: "Email" }), _jsx("input", { style: fld, ...onField("data.friend_contact.email") })] })] })] }), _jsxs("section", { style: card(12), children: [_jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [_jsx("h4", { style: cardTitle, children: "Existing Policies" }), _jsx("div", { children: _jsx("button", { onClick: () => ensureArray("data.existing_policies", (draft?.data?.existing_policies?.length ?? 0) + 1, () => ({
                                                        company_name: "",
                                                        type_of_product_policy_no: "",
                                                        sum_assured: "",
                                                        policy_start_date_current_conditions: "",
                                                        normal_premium_rate_additional_rate: "",
                                                        full_year_reduced_year: "",
                                                        date_if_policy_lapsed: "",
                                                    })), style: smallBtn, children: "+ Add" }) })] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12 }, children: (Array.isArray(draft?.data?.existing_policies) ? draft.data.existing_policies : []).map((_, i) => (_jsxs("div", { style: { gridColumn: "1 / span 12", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 }, children: [_jsxs("strong", { children: ["Policy #", i + 1] }), _jsx("button", { onClick: () => removeArrayIndex("data.existing_policies", i), style: smallBtn, children: "Remove" })] }), _jsxs("div", { style: grid3, children: [_jsxs("label", { children: [_jsx("span", { children: "Company" }), _jsx("input", { style: fld, ...onField(`data.existing_policies.${i}.company_name`) })] }), _jsxs("label", { children: [_jsx("span", { children: "Type / Policy No" }), _jsx("input", { style: fld, ...onField(`data.existing_policies.${i}.type_of_product_policy_no`) })] }), _jsxs("label", { children: [_jsx("span", { children: "Sum Assured" }), _jsx("input", { style: fld, ...onField(`data.existing_policies.${i}.sum_assured`) })] }), _jsxs("label", { children: [_jsx("span", { children: "Start Date / Conditions" }), _jsx("input", { style: fld, ...onField(`data.existing_policies.${i}.policy_start_date_current_conditions`) })] }), _jsxs("label", { children: [_jsx("span", { children: "Normal Rate / Additional" }), _jsx("input", { style: fld, ...onField(`data.existing_policies.${i}.normal_premium_rate_additional_rate`) })] }), _jsxs("label", { children: [_jsx("span", { children: "Full Year / Reduced" }), _jsx("input", { style: fld, ...onField(`data.existing_policies.${i}.full_year_reduced_year`) })] }), _jsxs("label", { children: [_jsx("span", { children: "Lapsed Date" }), _jsx("input", { style: fld, ...onField(`data.existing_policies.${i}.date_if_policy_lapsed`) })] })] })] }, i))) })] }), _jsxs("section", { style: card(12), children: [_jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [_jsx("h4", { style: cardTitle, children: "Beneficiaries" }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { onClick: () => {
                                                            const draftBeneLen = (draft?.data?.beneficiaries ?? []).length;
                                                            ensureBeneRows(draftBeneLen + 1);
                                                        }, style: smallBtn, children: "+ Add" }), _jsx("button", { onClick: () => ensureBeneRows(4), style: smallBtn, children: "Ensure 4 Rows" })] })] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "40px 1fr 1fr 1fr 120px 80px", gap: 8 }, children: (() => {
                                            const draftBene = draft?.data?.beneficiaries ?? [];
                                            const displayRows = draftBene.length > 4 ? draftBene : [...draftBene, ...Array(Math.max(0, 4 - draftBene.length)).fill({})];
                                            return displayRows.map((b, i) => {
                                                // Use normalized keys for the inputs to match PrintPage's set/get logic
                                                const namePath = `data.beneficiaries.${i}.name`;
                                                const nrcPath = `data.beneficiaries.${i}.nrc_number`;
                                                const relPath = `data.beneficiaries.${i}.relationship`;
                                                const pctPath = `data.beneficiaries.${i}.percentage`;
                                                return (_jsxs("div", { style: { display: "contents" }, children: [_jsx("div", { style: { alignSelf: "center" }, children: i + 1 }), _jsx("input", { style: fld, ...onField(namePath), placeholder: "Name" }), _jsx("input", { style: fld, ...onField(nrcPath), placeholder: "NRC Number" }), _jsx("input", { style: fld, ...onField(relPath), placeholder: "Relationship" }), _jsx("input", { style: fld, ...onField(pctPath), placeholder: "%" }), _jsx("button", { onClick: () => removeArrayIndex("data.beneficiaries", i), style: smallBtn, children: "Remove" })] }, i));
                                            });
                                        })() })] }), _jsxs("section", { style: card(12), children: [_jsx("h4", { style: cardTitle, children: "Bank Info" }), _jsxs("div", { style: grid3, children: [_jsxs("label", { children: [_jsx("span", { children: "Account Name" }), _jsx("input", { style: fld, ...onField("data.bank_info.bank_account_name") })] }), _jsxs("label", { children: [_jsx("span", { children: "Account Number" }), _jsx("input", { style: fld, ...onField("data.bank_info.bank_account_number") })] }), _jsxs("label", { children: [_jsx("span", { children: "Branch Name" }), _jsx("input", { style: fld, ...onField("data.bank_info.bank_branch_name") })] }), _jsxs("label", { children: [_jsx("span", { children: "Branch Code" }), _jsx("input", { style: fld, ...onField("data.bank_info.bank_branch_code") })] })] })] }), _jsxs("section", { style: card(12), children: [_jsx("h4", { style: cardTitle, children: "Acknowledgment" }), _jsxs("div", { style: grid3, children: [_jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("input", { type: "checkbox", checked: !!get(draft, "data.acknowledgment.accepted", false), onChange: (e) => setDraft((prev) => {
                                                            const next = JSON.parse(JSON.stringify(prev));
                                                            set(next, "data.acknowledgment.accepted", e.target.checked);
                                                            return next;
                                                        }) }), _jsx("span", { children: "Accepted" })] }), _jsxs("label", { children: [_jsx("span", { children: "Signature Date" }), _jsx("input", { style: fld, ...onField("data.acknowledgment.signature_date") })] }), _jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("input", { type: "checkbox", checked: !!get(draft, "data.acknowledgment.signature_handwritten", false), onChange: (e) => setDraft((prev) => {
                                                            const next = JSON.parse(JSON.stringify(prev));
                                                            set(next, "data.acknowledgment.signature_handwritten", e.target.checked);
                                                            return next;
                                                        }) }), _jsx("span", { children: "Signature Handwritten" })] })] })] }), _jsxs("section", { style: card(12), children: [_jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [_jsx("h4", { style: cardTitle, children: "Personal Statement" }), _jsx("button", { onClick: () => ensureArray("personal_sataement", (draft?.personal_sataement?.length ?? 0) + 1, () => ({
                                                    question: "",
                                                    answer: "",
                                                })), style: smallBtn, children: "+ Add" })] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 100px 80px", gap: 12 }, children: (Array.isArray(draft?.personal_sataement) ? draft.personal_sataement : []).map((_, i) => (_jsxs("div", { style: { display: "contents" }, children: [_jsx("input", { style: fld, ...onField(`personal_sataement.${i}.question`), placeholder: "Question" }), _jsx("input", { style: fld, ...onField(`personal_sataement.${i}.answer`), placeholder: "Answer" }), _jsx("button", { onClick: () => removeArrayIndex("personal_sataement", i), style: smallBtn, children: "Remove" })] }, i))) })] })] })] })), _jsx(FiveThreePrint, { data: renderData })] }));
}
const fld = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    outline: "none",
};
const card = (span) => ({
    gridColumn: `span ${span}`,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 12,
});
const cardTitle = {
    margin: 0,
    marginBottom: 8,
};
const grid2 = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
};
const grid3 = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
};
const smallBtn = {
    padding: "6px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
};
