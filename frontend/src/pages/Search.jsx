import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

const statuses = ["available", "checked_out", "on_hold", "missing", "under_repair"];

export default function Search({ user }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.listResources(q);
      setItems(res.items || res || []);
      setSelected(null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openResource(id) {
    setErr("");
    setMsg("");
    try {
      const r = await api.getResource(id);
      setSelected(r);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function reserve(resourceId) {
    setErr("");
    setMsg("");
    try {
      const r = await api.reserve(resourceId);
      setMsg(r.message || "Reserved / added to waitlist");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function changeStatus(copyId, status) {
    setErr("");
    setMsg("");
    try {
      await api.updateCopyStatus(copyId, status);
      setMsg("Status updated");
      if (selected?.id) await openResource(selected.id);
    } catch (e) {
      setErr(e.message);
    }
  }

  const isStaff = user?.role === "staff" || user?.role === "admin";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
      <div>
        <h2 style={{ marginTop: 0 }}>Search Resources</h2>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title/author/isbn..."
            style={{ flex: 1 }}
          />
          <button onClick={load} disabled={loading}>
            {loading ? "..." : "Search"}
          </button>
        </div>

        {err ? <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div> : null}
        {msg ? <div style={{ color: "green", marginBottom: 8 }}>{msg}</div> : null}

        <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
          {(items || []).map((r) => (
            <div
              key={r.id}
              style={{
                padding: 10,
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                background: selected?.id === r.id ? "#fafafa" : "white",
              }}
              onClick={() => openResource(r.id)}
            >
              <div style={{ fontWeight: 700 }}>{r.title}</div>
              <div style={{ opacity: 0.8, fontSize: 13 }}>{r.author || "—"} • ISBN: {r.isbn || "—"}</div>
            </div>
          ))}
          {(!items || items.length === 0) && <div style={{ padding: 12, opacity: 0.7 }}>No results</div>}
        </div>
      </div>

      <div>
        <h2 style={{ marginTop: 0 }}>Details</h2>

        {!selected ? (
          <div style={{ opacity: 0.7 }}>Select a resource to see copies and actions.</div>
        ) : (
          <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{selected.title}</div>
            <div style={{ opacity: 0.85, marginBottom: 8 }}>
              Author: {selected.author || "—"} • ISBN: {selected.isbn || "—"}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <button onClick={() => reserve(selected.id)}>Reserve / Join Waitlist</button>
            </div>

            <div style={{ fontWeight: 700, marginBottom: 6 }}>Copies</div>
            <div style={{ display: "grid", gap: 8 }}>
              {(selected.copies || []).map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: 10,
                    border: "1px solid #eee",
                    borderRadius: 10,
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      Copy #{c.id} • <span style={{ opacity: 0.85 }}>{c.status}</span>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>
                      {c.branch || "—"} / floor {c.floor || "—"} / shelf {c.shelf || "—"}
                    </div>
                  </div>

                  {isStaff ? (
                    <select value={c.status} onChange={(e) => changeStatus(c.id, e.target.value)}>
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ fontSize: 12, opacity: 0.6 }}>Staff only</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
