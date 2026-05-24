'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    if (!email.trim()) {
      setEmailError('Email is required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setServerError(
        apiErr.data?.message ??
          'Something went wrong. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <Link href="/" className="auth-logo">
        MyGiftList
      </Link>

      <div className="auth-card">
        {sent ? (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h1 className="auth-title" style={{ marginBottom: '10px' }}>
              Check your inbox
            </h1>
            <p className="auth-subtitle" style={{ marginBottom: '24px' }}>
              If an account exists for <strong>{email}</strong>, you&apos;ll
              receive a password reset link shortly.
            </p>
            <Link href="/login" className="btn btn-primary btn-full">
              Back to log in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Forgot password?</h1>
            <p className="auth-subtitle">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {serverError && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className={`input${emailError ? ' error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
                {emailError && <p className="form-error">{emailError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full"
                style={{ marginTop: '4px' }}
              >
                {loading ? <span className="spinner" /> : 'Send reset link'}
              </button>
            </form>

            <div className="divider">or</div>

            <p className="auth-footer-text">
              Remember it?{' '}
              <Link href="/login">Back to log in</Link>
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        .success-state {
          text-align: center;
        }

        .success-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--success-bg);
          color: var(--success);
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border: 1px solid rgba(61, 122, 90, 0.2);
        }

        .auth-footer-text {
          text-align: center;
          font-size: 0.875rem;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
