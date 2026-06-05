'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { publicApi } from '@/lib/api';

export default function CancelBookingPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleCancel() {
    setStatus('loading');
    try {
      const res = await publicApi.cancelBooking(uuid);
      const data = res as { message?: string };
      setMessage(data.message ?? 'Your booking has been cancelled.');
      setStatus('success');
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { message?: string } };
      if (apiErr.status === 404) {
        setMessage('This booking was not found. It may have already been cancelled.');
      } else {
        setMessage(apiErr.data?.message ?? 'Something went wrong. Please try again.');
      }
      setStatus('error');
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <Link href="/" style={{
        fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--primary)',
        textDecoration: 'none', marginBottom: 32, letterSpacing: '0.01em',
      }}>
        MyGiftList
      </Link>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)', padding: '40px', width: '100%', maxWidth: 440, textAlign: 'center',
      }}>
        {status === 'success' ? (
          <>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(61,122,90,0.2)' }}>✓</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 400, marginBottom: 10 }}>Booking cancelled</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
            <Link href="/" className="btn btn-primary">Back to home</Link>
          </>
        ) : status === 'error' ? (
          <>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--error-bg)', color: 'var(--error)', fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(185,64,64,0.2)' }}>!</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 400, marginBottom: 10 }}>Cancellation failed</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleCancel} className="btn btn-primary">Try again</button>
              <Link href="/" className="btn btn-outline">Go home</Link>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '2rem', marginBottom: 16 }}>🎁</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 400, marginBottom: 10 }}>Cancel your booking</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 8 }}>Booking reference:</p>
            <code style={{ display: 'block', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.8rem', color: 'var(--primary)', wordBreak: 'break-all', marginBottom: 24 }}>
              {uuid}
            </code>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 28 }}>
              This will release the gift so someone else can book it. This action cannot be undone.
            </p>
            <button onClick={handleCancel} disabled={status === 'loading'} className="btn btn-full"
              style={{ background: 'var(--error)', color: '#fff', borderColor: 'var(--error)', justifyContent: 'center' }}>
              {status === 'loading' ? <span className="spinner" /> : 'Cancel my booking'}
            </button>
            <Link href="/" style={{ display: 'block', marginTop: 16, fontSize: '0.875rem', color: 'var(--muted)', textDecoration: 'none' }}>
              ← Never mind, go back
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
