import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import s from './page.module.css';

export default function HomePage() {
  return (
    <div className={s.pageWrapper}>
      <Navbar />

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className={s.hero}>
          <div className={`container ${s.heroInner}`}>
            <div className={s.heroBadge}>Gift registries, made simple</div>
            <h1 className={s.heroTitle}>
              Share the gifts <br />
              <em>you truly want</em>
            </h1>
            <p className={s.heroLead}>
              Create a beautiful gift registry for your wedding, birthday, baby shower,
              or any celebration. Share a link — guests can book gifts without
              creating an account.
            </p>
            <div className={s.heroActions}>
              <Link href="/register" className="btn btn-primary btn-lg">
                Create your registry
              </Link>
              <Link href="/login" className="btn btn-outline btn-lg">
                Log in
              </Link>
            </div>
          </div>
          <div className={`${s.heroDeco} ${s.heroDeco1}`} />
          <div className={`${s.heroDeco} ${s.heroDeco2}`} />
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section className={s.features}>
          <div className="container">
            <h2 className={s.sectionTitle}>Everything you need</h2>
            <p className={s.sectionLead}>A thoughtful tool for every occasion.</p>

            <div className={s.featuresGrid}>
              <div className={s.featureCard}>
                <div className={s.featureIcon}>✦</div>
                <h3>Create your list</h3>
                <p>
                  Add gifts from any store. Set priorities, add descriptions, prices,
                  and direct product links so guests know exactly what to buy.
                </p>
              </div>
              <div className={s.featureCard}>
                <div className={s.featureIcon}>◈</div>
                <h3>Share with a link</h3>
                <p>
                  Every registry gets a unique URL. Send it to guests via message,
                  email, or your invitation — no logins required on their end.
                </p>
              </div>
              <div className={s.featureCard}>
                <div className={s.featureIcon}>◎</div>
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
        <section className={s.howItWorks}>
          <div className="container">
            <h2 className={s.sectionTitle}>How it works</h2>
            <p className={s.sectionLead}>Up and running in minutes.</p>

            <div className={s.steps}>
              <div className={s.step}>
                <div className={s.stepNumber}>01</div>
                <div className={s.stepBody}>
                  <h3>Create an account</h3>
                  <p>
                    Sign up for free. It only takes a moment and you&apos;ll be
                    ready to start building your list right away.
                  </p>
                </div>
              </div>
              <div className={s.stepDivider} />
              <div className={s.step}>
                <div className={s.stepNumber}>02</div>
                <div className={s.stepBody}>
                  <h3>Build your registry</h3>
                  <p>
                    Add items you genuinely want. Include a product link, price,
                    and how many you need. Organise by priority.
                  </p>
                </div>
              </div>
              <div className={s.stepDivider} />
              <div className={s.step}>
                <div className={s.stepNumber}>03</div>
                <div className={s.stepBody}>
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
        <section className={s.ctaSection}>
          <div className="container">
            <div className={s.ctaCard}>
              <h2 className={s.ctaTitle}>Ready to get started?</h2>
              <p className={s.ctaLead}>
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
    </div>
  );
}
