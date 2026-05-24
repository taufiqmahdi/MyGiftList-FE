'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface FieldErrors {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
}

export default function RegisterPage() {
  const { hydrateFromResponse } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function validate(): boolean {
    const errs: FieldErrors = {};

    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.username.trim()) errs.username = 'Username is required.';
    else if (!/^[a-z0-9_]+$/i.test(form.username))
      errs.username = 'Username may only contain letters, numbers, and underscores.';

    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address.';

    if (!form.phone.trim()) errs.phone = 'Phone number is required.';

    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';

    if (!form.password_confirmation)
      errs.password_confirmation = 'Please confirm your password.';
    else if (form.password !== form.password_confirmation)
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
      const res = await authApi.register(form);
      hydrateFromResponse(res);
      router.push('/dashboard');
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number;
        data?: { message?: string; errors?: Record<string, string[]> };
      };
      // Handle Laravel validation errors (422)
      if (apiErr.status === 422 && apiErr.data?.errors) {
        const laravelErrors: FieldErrors = {};
        const errors = apiErr.data.errors;
        if (errors.name) laravelErrors.name = errors.name[0];
        if (errors.username) laravelErrors.username = errors.username[0];
        if (errors.email) laravelErrors.email = errors.email[0];
        if (errors.phone) laravelErrors.phone = errors.phone[0];
        if (errors.password) laravelErrors.password = errors.password[0];
        setFieldErrors(laravelErrors);
      } else {
        setServerError(
          apiErr.data?.message ?? 'Registration failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function field(
    id: keyof typeof form,
    label: string,
    type = 'text',
    placeholder = '',
    autoComplete = ''
  ) {
    return (
      <div className="form-group">
        <label htmlFor={id} className="form-label">
          {label}
        </label>
        <input
          id={id}
          type={type}
          className={`input${fieldErrors[id] ? ' error' : ''}`}
          placeholder={placeholder}
          value={form[id]}
          onChange={update(id)}
          autoComplete={autoComplete || undefined}
        />
        {fieldErrors[id] && <p className="form-error">{fieldErrors[id]}</p>}
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <Link href="/" className="auth-logo">
        MyGiftList
      </Link>

      <div className="auth-card">
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">
          Free forever. No credit card required.
        </p>

        {serverError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {field('name', 'Full name', 'text', 'Jane Doe', 'name')}

          <div className="form-row">
            {field('username', 'Username', 'text', 'janedoe', 'username')}
            {field('phone', 'Phone number', 'tel', '08xxxxxxxxxx', 'tel')}
          </div>

          {field('email', 'Email address', 'email', 'you@example.com', 'email')}
          {field('password', 'Password', 'password', '••••••••', 'new-password')}
          {field(
            'password_confirmation',
            'Confirm password',
            'password',
            '••••••••',
            'new-password'
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: '6px' }}
          >
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <div className="divider">or</div>

        <p className="auth-footer-text">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>

      <style jsx>{`
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .auth-footer-text {
          text-align: center;
          font-size: 0.875rem;
          color: var(--muted);
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
