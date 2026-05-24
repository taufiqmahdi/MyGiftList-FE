import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-badge">Gift registries, made simple</div>
            <h1 className="hero-title">
              Share the gifts <br />
              <em>you truly want</em>
            </h1>
            <p className="hero-lead">
              Create a beautiful gift registry for your wedding, birthday, baby shower,
              or any celebration. Share a link — guests can book gifts without
              creating an account.
            </p>
            <div className="hero-actions">
              <Link href="/register" className="btn btn-primary btn-lg">
                Create your registry
              </Link>
              <Link href="/login" className="btn btn-outline btn-lg">
                Log in
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="hero-deco hero-deco-1" />
          <div className="hero-deco hero-deco-2" />
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section className="features">
          <div className="container">
            <h2 className="section-title">Everything you need</h2>
            <p className="section-lead">
              A thoughtful tool for every occasion.
            </p>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">✦</div>
                <h3>Create your list</h3>
                <p>
                  Add gifts from any store. Set priorities, add descriptions, prices,
                  and direct product links so guests know exactly what to buy.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">◈</div>
                <h3>Share with a link</h3>
                <p>
                  Every registry gets a unique URL. Send it to guests via message,
                  email, or your invitation — no logins required on their end.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">◎</div>
                <h3>Track bookings</h3>
                <p>
                  See which items have been claimed in real time. Avoid duplicates
                  and ensure every gift counts towards the celebration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section className="how-it-works">
          <div className="container">
            <h2 className="section-title">How it works</h2>
            <p className="section-lead">Up and running in minutes.</p>

            <div className="steps">
              <div className="step">
                <div className="step-number">01</div>
                <div className="step-body">
                  <h3>Create an account</h3>
                  <p>
                    Sign up for free. It only takes a moment and you&apos;ll be
                    ready to start building your list right away.
                  </p>
                </div>
              </div>
              <div className="step-divider" />
              <div className="step">
                <div className="step-number">02</div>
                <div className="step-body">
                  <h3>Build your registry</h3>
                  <p>
                    Add items you genuinely want. Include a product link, price,
                    and how many you need. Organise by priority.
                  </p>
                </div>
              </div>
              <div className="step-divider" />
              <div className="step">
                <div className="step-number">03</div>
                <div className="step-body">
                  <h3>Share &amp; celebrate</h3>
                  <p>
                    Share your registry link with guests. They browse, pick a gift,
                    and book it — no account needed on their side.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-card">
              <h2 className="cta-title">Ready to get started?</h2>
              <p className="cta-lead">
                Create your first registry today — it&apos;s completely free.
              </p>
              <Link href="/register" className="btn btn-accent btn-lg">
                Create your registry
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .page-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* ── Hero ── */
        .hero {
          position: relative;
          overflow: hidden;
          padding: 100px 0 90px;
          background: var(--bg);
        }

        .hero-inner {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-badge {
          display: inline-block;
          padding: 5px 16px;
          border: 1px solid var(--border);
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--muted);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 28px;
          background: var(--card);
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          font-weight: 300;
          line-height: 1.1;
          color: var(--primary);
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        .hero-title em {
          font-style: italic;
          color: var(--accent);
        }

        .hero-lead {
          font-size: 1.1rem;
          color: var(--muted);
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto 36px;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero-deco {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .hero-deco-1 {
          width: 400px;
          height: 400px;
          background: rgba(160, 103, 74, 0.07);
          top: -80px;
          right: -60px;
        }

        .hero-deco-2 {
          width: 300px;
          height: 300px;
          background: rgba(160, 103, 74, 0.05);
          bottom: -60px;
          left: -40px;
        }

        /* ── Sections ── */
        .features {
          padding: 80px 0;
          background: var(--card);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .section-title {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 3.5vw, 2.4rem);
          font-weight: 400;
          text-align: center;
          margin-bottom: 8px;
        }

        .section-lead {
          text-align: center;
          color: var(--muted);
          font-size: 1rem;
          margin-bottom: 52px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .feature-card {
          padding: 28px 24px;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg);
        }

        .feature-icon {
          font-size: 1.4rem;
          color: var(--accent);
          margin-bottom: 16px;
        }

        .feature-card h3 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 500;
          margin-bottom: 10px;
        }

        .feature-card p {
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.65;
        }

        /* ── How it works ── */
        .how-it-works {
          padding: 80px 0;
        }

        .steps {
          display: flex;
          align-items: flex-start;
          gap: 0;
          max-width: 860px;
          margin: 0 auto;
        }

        .step {
          flex: 1;
          padding: 0 20px;
        }

        .step-number {
          font-family: var(--font-display);
          font-size: 2.8rem;
          font-weight: 300;
          color: var(--accent);
          opacity: 0.5;
          line-height: 1;
          margin-bottom: 14px;
        }

        .step-body h3 {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .step-body p {
          font-size: 0.875rem;
          color: var(--muted);
          line-height: 1.65;
        }

        .step-divider {
          width: 1px;
          background: var(--border);
          align-self: stretch;
          margin-top: 10px;
        }

        /* ── CTA ── */
        .cta-section {
          padding: 60px 0 80px;
        }

        .cta-card {
          background: var(--primary);
          border-radius: var(--radius-lg);
          padding: 60px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta-title {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 300;
          color: #fff;
          margin-bottom: 12px;
        }

        .cta-lead {
          color: rgba(255,255,255,0.65);
          font-size: 1rem;
          margin-bottom: 28px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .hero {
            padding: 64px 0 60px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .steps {
            flex-direction: column;
            gap: 28px;
          }

          .step-divider {
            display: none;
          }

          .step {
            padding: 0;
          }

          .cta-card {
            padding: 40px 24px;
          }
        }
      `}</style>
    </div>
  );
}
