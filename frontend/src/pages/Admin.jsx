import React, { useEffect, useState } from "react";
import { api } from "../api";

function Box({ title, children }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 14 }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

export default function Admin() {
  const [err, setErr] = useState("");
  const [top, setTop] = useState(null);
  const [overdue, setOverdue] = useState(null);
  const [pressure, setPressure] = useState(null);

  async function load() {
    setErr("");
    try {
      const [a, b, c] = await Promise.all([api.topBorrowed(), api.overdue(), api.waitlistPressure()]);
      setTop(a);
      setOverdue(b);
      setPressure(c);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2 style={{ marginTop: 0 }}>Admin Analytics</h2>
      {err ? <div style={{ color: "crimson" }}>{err}</div> : null}

      <Box title="Top Borrowed (raw groupBy)">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(top, null, 2)}</pre>
      </Box>

      <Box title="Overdue Loans">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(overdue, null, 2)}</pre>
      </Box>

      <Box title="Waitlist Pressure">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(pressure, null, 2)}</pre>
      </Box>
    </div>
  );
}
