'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const colors: Record<ToastType, { bg: string; color: string; border: string }> = {
    success: { bg: 'var(--success-bg)', color: 'var(--success)', border: 'rgba(61,122,90,0.2)' },
    error:   { bg: 'var(--error-bg)',   color: 'var(--error)',   border: 'rgba(185,64,64,0.2)' },
    info:    { bg: '#EFF6FF',           color: '#1D4ED8',        border: 'rgba(29,78,216,0.2)' },
  };

  const icons: Record<ToastType, string> = {
    success: '✓', error: '✕', info: 'ℹ',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 999, display: 'flex', flexDirection: 'column', gap: '10px',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const c = colors[t.type];
          return (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px',
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)',
                color: c.color,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-body)',
                minWidth: '260px', maxWidth: '380px',
                pointerEvents: 'all',
                animation: 'slideUp 0.2s ease',
              }}
            >
              <span style={{ fontWeight: 600, flexShrink: 0 }}>{icons[t.type]}</span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: c.color, opacity: 0.6, fontSize: '1rem', padding: '0 2px',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}
