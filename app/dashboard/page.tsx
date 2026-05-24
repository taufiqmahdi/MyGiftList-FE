'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <span className="spinner spinner-dark" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">
                Hello, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="dashboard-subtitle">
                Manage your gift registries and share them with guests.
              </p>
            </div>
            <button className="btn btn-primary" disabled>
              + New registry
            </button>
          </div>

          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <h2 className="empty-title">No registries yet</h2>
            <p className="empty-text">
              Your registries will appear here once you create one. Registry
              management is coming next!
            </p>
            <Link href="/" className="btn btn-outline">
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .page-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-main {
          flex: 1;
          padding: 48px 0 80px;
        }

        .dashboard-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 48px;
        }

        .dashboard-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 400;
          margin-bottom: 6px;
        }

        .dashboard-subtitle {
          font-size: 0.9375rem;
          color: var(--muted);
        }

        .empty-state {
          border: 1px dashed var(--border);
          border-radius: var(--radius-lg);
          padding: 72px 32px;
          text-align: center;
          background: var(--card);
        }

        .empty-icon {
          font-size: 2.2rem;
          color: var(--border);
          margin-bottom: 18px;
        }

        .empty-title {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 400;
          margin-bottom: 10px;
        }

        .empty-text {
          color: var(--muted);
          font-size: 0.9rem;
          max-width: 380px;
          margin: 0 auto 24px;
          line-height: 1.65;
        }

        @media (max-width: 640px) {
          .dashboard-header {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
