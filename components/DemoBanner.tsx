'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { resetDb } from '@/lib/demo/store';

export default function DemoBanner() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleReset() {
    resetDb();
    // Registries created in the demo no longer exist after a reset, so leave their pages
    if (window.location.pathname.startsWith('/dashboard/')) window.location.assign('/dashboard');
    else window.location.reload();
  }

  return (
    <>
      <div className="demo-banner" role="status">
        <span>
          <strong>Demo mode</strong> — log in with any email and password. Your changes are saved only in this browser.
        </span>
        <button type="button" className="demo-reset" onClick={() => setConfirmOpen(true)}>
          Reset demo data
        </button>
      </div>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Reset demo data?" size="sm">
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>
          This puts back the sample registries, items and bookings, and removes anything you have added or changed.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => setConfirmOpen(false)}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleReset}>Reset</button>
        </div>
      </Modal>

      <style jsx>{`
        .demo-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 6px 14px;
          padding: 8px 16px;
          background: var(--accent-light);
          border-bottom: 1px solid var(--border);
          color: var(--primary);
          font-size: 0.82rem;
          line-height: 1.5;
          text-align: center;
        }

        .demo-reset {
          background: none;
          border: 1px solid var(--accent);
          border-radius: var(--radius-sm);
          color: var(--accent);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 0.78rem;
          font-weight: 500;
          padding: 3px 10px;
          white-space: nowrap;
        }

        .demo-reset:hover {
          background: var(--accent);
          color: #fff;
        }
      `}</style>
    </>
  );
}
