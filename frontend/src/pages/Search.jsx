import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Search({ user }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.listResources(q);
      setItems(res.items || res || []);
    } finally {
      setLoading(false);
    }
  }

  async function openResource(id) {
    const r = await api.getResource(id);
    setSelected(r);
  }

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 350px' : '1fr', gap: '2rem', transition: 'all 0.3s ease' }}>
      
      {/* Left: Content */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="h1-title">Library Catalog</h1>
          <div style={{ position: 'relative', width: '300px' }}>
            <input 
              placeholder="Search books, authors, ISBNs..." 
              value={q} 
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()}
              style={{ paddingRight: '3rem' }}
            />
            <button 
              onClick={load}
              style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              🔍
            </button>
          </div>
        </div>

        {loading ? (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
             {[1,2,3,4].map(i => <div key={i} className="glass-panel" style={{ height: 200, background: '#f1f5f9' }}></div>)}
           </div>
        ) : (
          <div className="grid-cards">
            {items.map(r => (
              <div 
                key={r.id} 
                className="glass-panel interactive"
                onClick={() => openResource(r.id)}
                style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '180px' }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4 }}>{r.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{r.author}</p>
                </div>
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', background: '#f8fafc', padding: '2px 8px', borderRadius: 4 }}>ISBN {r.isbn}</span>
                   <span style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 600 }}>View Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Details Panel (Conditional) */}
      {selected && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>DETAILS</span>
            <button onClick={() => setSelected(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>{selected.title}</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem' }}>by {selected.author}</p>

          <button 
            className="btn-xl" 
            style={{ width: '100%', marginBottom: '2rem' }}
            onClick={async () => {
              try {
                const res = await api.reserve(selected.id);
                alert(res.message || "Reserved!");
              } catch(e) { alert(e.message); }
            }}
          >
            Place Reservation
          </button>

          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>AVAILABLE COPIES</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selected.copies?.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                   <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>ID: {c.id}</div>
                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.branch} • {c.shelf}</div>
                </div>
                <div className={`badge-pill status-${c.status}`}>{c.status.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}