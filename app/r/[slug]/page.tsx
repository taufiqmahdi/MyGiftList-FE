'use client';

import { useEffect, useState, FormEvent, use } from 'react';
import Link from 'next/link';
import { publicApi, Registry, RegistryItem } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import s from './page.module.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in (res as object)) {
    return (res as { data: T }).data;
  }
  return res as T;
}

function sameId(a: unknown, b: unknown) {
  return Number(a) === Number(b);
}

// Try every field name the backend might use for the booking reference
function extractBookingId(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const d = data as Record<string, unknown>;
  return String(
    d.booking_id ?? d.uuid ?? d.cancellation_uuid ?? d.token ?? d.id ?? ''
  );
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Wedding', birthday: 'Birthday', baby_shower: 'Baby Shower',
  graduation: 'Graduation', housewarming: 'Housewarming', anniversary: 'Anniversary', other: 'Other',
};

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatPrice(p: number | null | undefined) {
  if (p == null) return null;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p);
}

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  high:   { bg: '#FEE2E2', color: '#991B1B' },
  medium: { bg: '#FEF3C7', color: '#92400E' },
  low:    { bg: '#F3F4F6', color: '#6B7280' },
};

// ─── Booking Modal ────────────────────────────────────────────────────────────

interface BookingFormData {
  booker_name: string;
  booker_email: string;
  quantity_booked: string;
  note: string;
}

function BookingModal({ item, slug, onClose, onBooked }: {
  item: RegistryItem;
  slug: string;
  onClose: () => void;
  onBooked: (itemId: number, qty: number) => void;
}) {
  const available = item.quantity - (item.quantity_booked ?? 0);
  const [form, setForm] = useState<BookingFormData>({ booker_name: '', booker_email: '', quantity_booked: '1', note: '' });
  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState('');

  function set<K extends keyof BookingFormData>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function validate() {
    const e: Partial<BookingFormData> = {};
    if (!form.booker_name.trim()) e.booker_name = 'Your name is required.';
    if (!form.booker_email.trim()) e.booker_email = 'Your email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.booker_email)) e.booker_email = 'Enter a valid email.';
    const qty = parseInt(form.quantity_booked);
    if (isNaN(qty) || qty < 1) e.quantity_booked = 'Enter a valid quantity.';
    else if (qty > available) e.quantity_booked = `Only ${available} available.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      const res = await publicApi.bookItem(slug, item.id, {
        booker_name: form.booker_name,
        booker_email: form.booker_email,
        quantity_booked: parseInt(form.quantity_booked),
        note: form.note || undefined,
      });
      const raw = unwrap<Record<string, unknown>>(res);
      const data = unwrap<Record<string, unknown>>(raw);
      const bid = extractBookingId(data);
      setBookingId(bid || null);
      // onBooked(item.id, parseInt(form.quantity_booked));
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setServerError(apiErr.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (bookingId !== undefined && bookingId !== null && !serverError && !loading && form.booker_email && !errors.booker_email) {
    if (form.booker_name && !Object.keys(errors).length) {
      // Only show success after a booking was confirmed
    }
  }

  // Show success if we set bookingId (even empty string means API responded OK)
  const bookingConfirmed = bookingId !== null;

  if (bookingConfirmed) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className={s.successIcon}>✓</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, marginBottom: 10 }}>
          Gift booked!
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
          You&apos;ve reserved <strong>{form.quantity_booked}×</strong> <strong>{item.name}</strong>.
        </p>

        <div style={{
          background: 'var(--bg-alt)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          marginBottom: 20,
          textAlign: 'left',
        }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Need to cancel?</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
            A cancellation link has been sent to <strong>{form.booker_email}</strong>. Use that link
            if your plans change — no account needed.
          </p>
        </div>

        <button
          onClick={() => {
            onBooked(item.id, parseInt(form.quantity_booked));
            onClose();
          }}
          className="btn btn-primary"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className={s.bookingItem}>
        {item.image_url && (
          <img src={item.image_url} alt={item.name} className={s.bookingItemImg}
            referrerPolicy="no-referrer" crossOrigin="anonymous"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
        <div>
          <p className={s.bookingItemName}>{item.name}</p>
          {formatPrice(item.price) && <p className={s.bookingItemPrice}>{formatPrice(item.price)}</p>}
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{available} still available</p>
        </div>
      </div>

      {serverError && <div className="alert alert-error" style={{ marginBottom: 16 }}>{serverError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label">Your name *</label>
          <input className={`input${errors.booker_name ? ' error' : ''}`} value={form.booker_name}
            onChange={e => set('booker_name', e.target.value)} placeholder="Jane Smith" autoFocus />
          {errors.booker_name && <p className="form-error">{errors.booker_name}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Your email *</label>
          <input className={`input${errors.booker_email ? ' error' : ''}`} type="email"
            value={form.booker_email} onChange={e => set('booker_email', e.target.value)} placeholder="jane@example.com" />
          {errors.booker_email && <p className="form-error">{errors.booker_email}</p>}
        </div>

        {available > 1 && (
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input className={`input${errors.quantity_booked ? ' error' : ''}`} type="number"
              min={1} max={available} value={form.quantity_booked}
              onChange={e => set('quantity_booked', e.target.value)} />
            {errors.quantity_booked && <p className="form-error">{errors.quantity_booked}</p>}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Note <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></label>
          <textarea className="input" style={{ minHeight: 68, resize: 'vertical' }}
            value={form.note} onChange={e => set('note', e.target.value)}
            placeholder="A message for the registry owner…" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-accent">
            {loading ? <span className="spinner" /> : 'Confirm booking'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function PublicItemCard({ item, onBook }: { item: RegistryItem; onBook: () => void }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [item.image_url]);

  const available = item.quantity_remaining;
  const fullyBooked = item.is_fully_booked;
  const purchased = item.is_purchased;
  const pri = PRIORITY_COLORS[item.priority] ?? PRIORITY_COLORS.low;

  return (
    <div className={`${s.itemCard} ${fullyBooked || purchased ? s.itemCardFull : ''}`}>
      {item.image_url && !imgError ? (
        <div className={s.itemImgWrap}>
          <img src={item.image_url} alt={item.name}
            referrerPolicy="no-referrer" crossOrigin="anonymous"
            onError={() => setImgError(true)} />
        </div>
      ) : (
        <div className={s.itemImgPlaceholder}>🎁</div>
      )}

      <div className={s.itemContent}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: 600, background: pri.bg, color: pri.color }}>
            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} priority
          </span>
          {(fullyBooked || purchased) && (
            <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: 600, background: 'var(--success-bg)', color: 'var(--success)' }}>
              {item.is_purchased ? 'Purchased' : 'Claimed'}
            </span>
          )}
        </div>

        <h3 className={s.itemName}>{item.name}</h3>
        {item.description && <p className={s.itemDesc}>{item.description}</p>}

        <div className={s.itemBottom}>
          <div>
            {formatPrice(item.price) && <p className={s.itemPrice}>{formatPrice(item.price)}</p>}
            <p className={s.itemAvail}>
              {item.is_purchased
                ? 'Already purchased'
                : fullyBooked
                  ? 'Fully claimed'
                  : `${available} of ${item.quantity} available`}
            </p>
          </div>
          {item.product_url && (
            <a href={item.product_url} target="_blank" rel="noopener noreferrer" className={s.viewLink}>View ↗</a>
          )}
        </div>

        <button
          onClick={onBook}
          disabled={fullyBooked || purchased}
          className={`btn ${fullyBooked || purchased ? 'btn-outline' : 'btn-accent'} btn-full`}
          style={{ marginTop: 14, fontSize: '0.875rem', opacity: fullyBooked || purchased ? 0.5 : 1 }}
        >
          {fullyBooked || purchased ? (item.is_purchased ? 'Already purchased' : 'Already claimed') : 'Book this gift'}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicRegistryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bookingItem, setBookingItem] = useState<RegistryItem | null>(null);

  useEffect(() => {
    publicApi.getRegistry(slug)
      .then(res => {
        const payload = unwrap<{ registry: Registry; items: RegistryItem[] }>(res);
        const reg = payload.registry ?? (payload as unknown as Registry);
        const itms = payload.items ?? [];
        setRegistry(reg);
        setItems(Array.isArray(itms) ? itms : []);
      })
      .catch((err: { status?: number }) => {
        if (err?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  function handleBooked(itemId: number, qty: number) {
    setItems(prev => prev.map(i =>
      sameId(i.id, itemId)
        ? { ...i, quantity_remaining: i.quantity_remaining - qty, is_fully_booked: i.quantity_remaining - qty <= 0 ? true : i.is_fully_booked }
        : i
    ));
    // Also close the modal so the user sees the updated list
    setBookingItem(null);
  }

  console.log(items)

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}><span className="spinner spinner-dark" /></div>;
  }

  if (notFound || !registry) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 16 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400 }}>Registry not found</h1>
        <p style={{ color: 'var(--muted)' }}>This registry doesn&apos;t exist or has been made private.</p>
        <Link href="/" className="btn btn-primary">Go home</Link>
      </div>
    );
  }

  const totalCount    = items.reduce((sum, i) => sum + i.quantity, 0);
  const claimedCount  = items.reduce((sum, i) => sum + (i.is_purchased ? 0 : i.quantity - i.quantity_remaining), 0);
  const totalClaimedCount    = items.reduce((sum, i) => sum + (i.is_purchased ? 0 : i.quantity), 0); 
  const purchasedCount = items.reduce((sum, i) => sum + (i.is_purchased ? i.quantity : 0), 0);
  const totalPurchasedCount    = items.reduce((sum, i) => sum + (i.is_purchased ? i.quantity : 0), 0); 

  // Available: not purchased by owner AND still has unbooked quantity
  const availableItems = items.filter(i => !i.is_purchased && i.quantity_remaining > 0);
  // Claimed/purchased: owner marked purchased OR fully booked by guests
  const claimedItems = items.filter(i => i.is_purchased || i.is_fully_booked || i.quantity_remaining <= 0);

  return (
    <div className={s.page}>
      <header className={s.topBar}>
        <div className={`container ${s.topBarInner}`}>
          <Link href="/" className={s.brand}>MyGiftList</Link>
          <Link href="/register" className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '6px 14px' }}>
            Create your own →
          </Link>
        </div>
      </header>

      <section className={s.hero}>
        <div className={`container ${s.heroInner}`}>
          <div className={s.heroBadge}>{EVENT_TYPE_LABELS[registry.event_type] ?? registry.event_type}</div>
          <h1 className={s.heroTitle}>{registry.title}</h1>
          {registry.description && <p className={s.heroDesc}>{registry.description}</p>}
          {registry.event_date && <p className={s.heroDate}>📅 {formatDate(registry.event_date)}</p>}
          <p className={s.heroStats}>{items.length} gifts · {claimedCount} of {totalClaimedCount} items claimed · {purchasedCount} of {totalPurchasedCount} gifts purchased</p>
        </div>
      </section>

      <main className={s.main}>
        <div className="container">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <p>No items have been added to this registry yet.</p>
            </div>
          ) : (
            <>
              {availableItems.length > 0 && (
                <section className={s.section}>
                  <h2 className={s.sectionTitle}>Available gifts</h2>
                  <div className={s.grid}>
                    {availableItems.map(item => (
                      <PublicItemCard key={item.id} item={item} onBook={() => setBookingItem(item)} />
                    ))}
                  </div>
                </section>
              )}
              {claimedItems.length > 0 && (
                <section className={s.section}>
                  <h2 className={s.sectionTitle} style={{ color: 'var(--muted)' }}>Already claimed</h2>
                  <div className={s.grid}>
                    {claimedItems.map(item => (
                      <PublicItemCard key={item.id} item={item} onBook={() => {}} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <footer className={s.footer}>
        <div className="container" style={{ textAlign: 'center' }}>
          <Link href="/" className={s.brand} style={{ display: 'inline-block', marginBottom: 8 }}>MyGiftList</Link>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            Want to create your own registry? <Link href="/register">Get started free →</Link>
          </p>
        </div>
      </footer>

      <Modal
        isOpen={!!bookingItem}
        onClose={() => setBookingItem(null)}
        title={`Book: ${bookingItem?.name ?? ''}`}
        size="md"
      >
        {bookingItem && (
          <BookingModal
            key={bookingItem.id}
            item={bookingItem}
            slug={slug}
            onClose={() => setBookingItem(null)}
            onBooked={handleBooked}
          />
        )}
      </Modal>
    </div>
  );
}
