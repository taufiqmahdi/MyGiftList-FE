'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, FormEvent, Suspense } from 'react';
import { authApi } from '@/lib/api';

interface FieldErrors {
  password?: string;
  password_confirmation?: string;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Token / email missing from URL
  if (!token || !email) {
    return (
      <div className="auth-wrapper">
        <Link href="/" className="auth-logo">
          MyGiftList
        </Link>
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="error-icon">!</div>
          <h1 className="auth-title" style={{ marginBottom: '10px' }}>
            Invalid link
          </h1>
          <p className="auth-subtitle" style={{ marginBottom: '24px' }}>
            This password reset link is missing required information. Please
            request a new one.
          </p>
          <Link href="/forgot-password" className="btn btn-primary btn-full">
            Request new link
          </Link>
        </div>
        <style jsx>{`
          .error-icon {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: var(--error-bg);
            color: var(--error);
            font-size: 1.4rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            border: 1px solid rgba(185,64,64,0.2);
          }
        `}</style>
      </div>
    );
  }

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!passwordConfirmation) errs.password_confirmation = 'Please confirm your password.';
    else if (password !== passwordConfirmation)
      errs.password_confirmation = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      await authApi.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number;
        data?: { message?: string; errors?: Record<string, string[]> };
      };
      if (apiErr.status === 422 && apiErr.data?.errors) {
        const errors = apiErr.data.errors;
        const errs: FieldErrors = {};
        if (errors.password) errs.password = errors.password[0];
        if (errors.password_confirmation)
          errs.password_confirmation = errors.password_confirmation[0];
        setFieldErrors(errs);
      } else {
        setServerError(
          apiErr.data?.message ??
            'Unable to reset your password. The link may have expired.'
        );
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
        {success ? (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h1 className="auth-title" style={{ marginBottom: '10px' }}>
              Password updated!
            </h1>
            <p className="auth-subtitle">
              Your password has been reset. Redirecting you to log in…
            </p>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Set new password</h1>
            <p className="auth-subtitle">
              Choose a strong password for{' '}
              <span className="email-highlight">{email}</span>
            </p>

            {serverError && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  className={`input${fieldErrors.password ? ' error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                />
                {fieldErrors.password && (
                  <p className="form-error">{fieldErrors.password}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirm" className="form-label">
                  Confirm new password
                </label>
                <input
                  id="confirm"
                  type="password"
                  className={`input${
                    fieldErrors.password_confirmation ? ' error' : ''
                  }`}
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  autoComplete="new-password"
                />
                {fieldErrors.password_confirmation && (
                  <p className="form-error">{fieldErrors.password_confirmation}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full"
                style={{ marginTop: '4px' }}
              >
                {loading ? <span className="spinner" /> : 'Reset password'}
              </button>
            </form>

            <div className="divider">or</div>

            <p className="auth-footer-text">
              Remember it? <Link href="/login">Back to log in</Link>
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

        .email-highlight {
          color: var(--accent);
          font-style: italic;
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-wrapper">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <span className="spinner spinner-dark" />
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
