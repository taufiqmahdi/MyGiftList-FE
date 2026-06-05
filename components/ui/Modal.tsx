'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = { sm: '420px', md: '560px', lg: '720px' };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(30,25,22,0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: maxWidths[size],
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 0',
            marginBottom: '20px',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400,
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.4rem', color: 'var(--muted)', lineHeight: 1,
                padding: '4px', borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: title ? '0 24px 24px' : '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
