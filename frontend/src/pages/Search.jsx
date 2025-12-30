import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Search({ user }) {
  const [q, setQ] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], facets: [], totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.listResources(q, selectedTag === "All" ? "" : selectedTag, page);
      setData(res);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [page, selectedTag]);

  return (
    <div className="app-shell" style={{ overflow: 'hidden' }}>
      {/* Sidebar Filters */}
      <div className="glass-panel" style={{ width: '250px', padding: '1.5rem', marginRight: '2rem', height: 'fit-content', flexShrink: 0 }}>
        <h3 style={{ marginTop: 0 }}>Categories</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {["All", ...data.facets].map(tag => (
            <button 
              key={tag}
              onClick={() => { setSelectedTag(tag); setPage(1); }}
              className={`btn-ghost ${selectedTag === tag ? 'active-filter' : ''}`}
              style={{ textAlign: 'left', background: selectedTag === tag ? 'var(--primary)' : '', color: selectedTag === tag ? 'white' : '' }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            placeholder="Search title, author, ISBN..." 
            value={q} 
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
          />
          <button className="btn-xl" onClick={load}>Search</button>
        </div>

        {loading ? <div>Loading library...</div> : (
          <div className="grid-cards">
            {data.items.map(r => (
              <div key={r.id} className="glass-panel interactive" onClick={() => setSelected(r)} style={{ padding: '1.5rem', cursor: 'pointer' }}>
                <div style={{ height: '140px', background: 'linear-gradient(to bottom right, #e0e7ff, #f3f4f6)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                  📖
                </div>
                <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>{r.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                  <span>{r.author}</span>
                  <span>⭐ {r._count?.reviews || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost">Previous</button>
          <span style={{ padding: '0.5rem 1rem' }}>Page {page} of {data.totalPages}</span>
          <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="btn-ghost">Next</button>
        </div>
      </div>

      {/* Details Modal (Simplified for brevity) */}
      {selected && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }} onClick={() => setSelected(null)}>
          <div className="glass-panel" style={{ width: '600px', padding: '2rem', background: 'white' }} onClick={e => e.stopPropagation()}>
            <h2>{selected.title}</h2>
            <p>{selected.description}</p>
            <button className="btn-xl" onClick={async () => {
               await api.reserve(selected.id);
               alert("Reserved!");
            }}>Reserve Now</button>
          </div>
        </div>
      )}
    </div>
  );
}