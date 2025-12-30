import React, { useState } from "react";
import { api } from "../api";

export default function Staff() {
  const [userId, setUserId] = useState("1");
  const [copyId, setCopyId] = useState("");
  const [returnCopyId, setReturnCopyId] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function checkout() {
    setErr("");
    setMsg("");
    try {
      const r = await api.checkout(Number(userId), Number(copyId));
      setMsg(`Checked out OK. Loan id: ${r.id || r.loanId || "?"}`);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function doReturn() {
    setErr("");
    setMsg("");
    try {
      const r = await api.returns(Number(returnCopyId));
      setMsg(`Return OK. Promoted user: ${r.promotedUserId ?? "none"}`);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 style={{ marginTop: 0 }}>Staff Dashboard</h2>

      {err ? <div style={{ color: "crimson", marginBottom: 10 }}>{err}</div> : null}
      {msg ? <div style={{ color: "green", marginBottom: 10 }}>{msg}</div> : null}

      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <h3 style={{ marginTop: 0 }}>Checkout</h3>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            User ID (borrower)
            <input value={userId} onChange={(e) => setUserId(e.target.value)} />
          </label>
          <label>
            Copy ID
            <input value={copyId} onChange={(e) => setCopyId(e.target.value)} />
          </label>
          <button onClick={checkout}>Checkout</button>
        </div>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 14 }}>
        <h3 style={{ marginTop: 0 }}>Return</h3>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            Copy ID
            <input value={returnCopyId} onChange={(e) => setReturnCopyId(e.target.value)} />
          </label>
          <button onClick={doReturn}>Return Copy</button>
        </div>
      </div>

      <div style={{ marginTop: 10, opacity: 0.75 }}>
        Tip: use Search page to see Copy IDs.
      </div>
    </div>
  );
}
