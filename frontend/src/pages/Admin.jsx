import React, { useEffect, useState } from "react";
import { api } from "../api";

function StatCard({ title, value, color }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{title}</p>
      <p style={{ margin: '0.5rem 0 0', fontSize: '2.5rem', fontWeight: 800, color: color, letterSpacing: '-0.05em' }}>{value}</p>
    </div>
  );
}

export default function Admin() {
  const [data, setData] = useState({ top: [], overdue: [], pressure: [] });
  
  useEffect(() => {
    Promise.all([api.topBorrowed(), api.overdue(), api.waitlistPressure()])
      .then(([top, overdue, pressure]) => setData({ top, overdue, pressure }));
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="h1-title">System Overview</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="Overdue Items" value={data.overdue.length} color="#ef4444" />
        <StatCard title="Total Waitlists" value={data.pressure.reduce((a,b)=>a+b._count.id, 0)} color="#f59e0b" />
        <StatCard title="Active Resources" value={data.top.length} color="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Main Table */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Top Borrowed Books</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>TITLE</th>
                <th style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'right' }}>LOANS</th>
                <th style={{ padding: '1rem 0', width: '100px' }}></th>
              </tr>
            </thead>
            <tbody>
              {data.top.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 600 }}>{t.title}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 700, color: '#6366f1' }}>{t._count.loans}</td>
                  <td style={{ padding: '1rem 0 1rem 1.5rem' }}>
                    <div style={{ height: 6, width: '100%', background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(t._count.loans * 5, 100)}%`, background: '#6366f1' }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Side List */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Waitlist Pressure</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.pressure.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{p.title}</div>
                <div style={{ background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {p._count.id} waiting
                </div>
              </div>
            ))}
            {data.pressure.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center' }}>All clear</div>}
          </div>
        </div>

      </div>
    </div>
  );
}