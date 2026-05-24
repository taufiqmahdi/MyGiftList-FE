'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.push('/');
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          MyGiftList
        </Link>

        {/* Desktop nav */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <span className="navbar-greeting">Hello, {user?.name?.split(' ')[0]}</span>
              <Link href="/dashboard" className="btn btn-outline btn-sm">
                My Registries
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn btn-primary btn-sm"
              >
                {loggingOut ? <span className="spinner" /> : 'Log out'}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline btn-sm">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="mobile-link">
                My Registries
              </Link>
              <button onClick={handleLogout} className="mobile-link mobile-link-btn">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="mobile-link">
                Log in
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="mobile-link mobile-link-accent">
                Get started
              </Link>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(250, 248, 245, 0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }

        .navbar-logo {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 500;
          color: var(--primary);
          letter-spacing: 0.01em;
          text-decoration: none;
        }

        .navbar-logo:hover {
          color: var(--accent);
          text-decoration: none;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .navbar-greeting {
          font-size: 0.875rem;
          color: var(--muted);
          margin-right: 4px;
        }

        .btn-sm {
          padding: 7px 16px;
          font-size: 0.875rem;
        }

        .navbar-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .ham-line {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--primary);
          border-radius: 2px;
          transition: transform 0.2s, opacity 0.2s;
        }

        .navbar-mobile-menu {
          display: none;
          flex-direction: column;
          padding: 12px 20px 16px;
          border-top: 1px solid var(--border);
          gap: 2px;
        }

        .mobile-link {
          display: block;
          padding: 10px 4px;
          font-size: 0.9375rem;
          color: var(--primary);
          text-decoration: none;
          border-bottom: 1px solid var(--border);
        }

        .mobile-link:last-child {
          border-bottom: none;
        }

        .mobile-link-btn {
          background: none;
          border: none;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          font-family: var(--font-body);
          text-align: left;
          width: 100%;
        }

        .mobile-link-accent {
          color: var(--accent);
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .navbar-actions {
            display: none;
          }

          .navbar-hamburger {
            display: flex;
          }

          .navbar-mobile-menu {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
}
