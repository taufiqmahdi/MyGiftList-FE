'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { message?: string } };
      if (apiErr.status === 401 || apiErr.status === 422) {
        setServerError(
          apiErr.data?.message ?? 'Invalid email or password. Please try again.'
        );
      } else {
        setServerError('Something went wrong. Please try again.');
      }
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
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to manage your registries</p>

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
              className={`input${fieldErrors.email ? ' error' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
            {fieldErrors.email && (
              <p className="form-error">{fieldErrors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`input${fieldErrors.password ? ' error' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="form-error">{fieldErrors.password}</p>
            )}
          </div>

          <div className="forgot-row">
            <Link href="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: '4px' }}
          >
            {loading ? <span className="spinner" /> : 'Log in'}
          </button>
        </form>

        <div className="divider">or</div>

        <p className="auth-footer-text">
          Don&apos;t have an account?{' '}
          <Link href="/register">Create one free</Link>
        </p>
      </div>

      <style jsx>{`
        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 18px;
          margin-top: -6px;
        }

        .forgot-link {
          font-size: 0.82rem;
          color: var(--muted);
        }

        .forgot-link:hover {
          color: var(--accent);
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
