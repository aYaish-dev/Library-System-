import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function MyLoans() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.myLoans().then(r => setItems(r.items || r || []));
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      <h1 className="h1-title">My Loans</h1>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {items.map(loan => {
          const due = new Date(loan.dueAt);
          const isOverdue = !loan.returnedAt && due < new Date();
          const daysLeft = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));

          return (
            <div key={loan.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: isOverdue ? '4px solid #ef4444' : '4px solid #10b981' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.25rem' }}>LOAN #{loan.id}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Copy #{loan.copyId}</div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                 {loan.returnedAt ? (
                   <span className="badge-pill" style={{ background: '#f1f5f9', color: '#64748b' }}>Returned</span>
                 ) : (
                   <>
                     <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isOverdue ? '#ef4444' : '#10b981' }}>
                       {isOverdue ? 'Overdue' : `${daysLeft} days`}
                     </div>
                     <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                       Due {due.toLocaleDateString()}
                     </div>
                   </>
                 )}
              </div>
            </div>
          )
        })}
        {items.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No active loans found. Time to read!</div>}
      </div>
    </div>
  );
}