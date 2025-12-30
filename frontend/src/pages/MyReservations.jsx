import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function MyReservations() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const r = await api.myReservations();
      setItems(r.items || r || []);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>My Reservations</h2>
      {err ? <div style={{ color: "crimson" }}>{err}</div> : null}

      <div style={{ display: "grid", gap: 8 }}>
        {items.map((x) => (
          <div key={x.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 800 }}>
              Reservation #{x.id} • active: {x.isActive ? "yes" : "no"}
            </div>
            <div style={{ opacity: 0.8 }}>
              resourceId: {x.resourceId} • created: {x.createdAt ? new Date(x.createdAt).toLocaleString() : "—"}
            </div>
          </div>
        ))}
        {items.length === 0 ? <div style={{ opacity: 0.7 }}>No reservations yet</div> : null}
      </div>
    </div>
  );
}
