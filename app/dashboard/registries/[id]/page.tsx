'use client';

import { useEffect, useState, FormEvent, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { registryApi, Registry, RegistryItem } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Modal from '@/components/ui/Modal';
import s from './page.module.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in (res as object)) {
    return (res as { data: T }).data;
  }
  return res as T;
}

// Loose numeric equality — handles backend returning id as string vs number
function sameId(a: unknown, b: unknown) {
  return Number(a) === Number(b);
}

const EVENT_TYPES = [
  { value: 'wedding',      label: 'Wedding' },
  { value: 'birthday',     label: 'Birthday' },
  { value: 'baby_shower',  label: 'Baby Shower' },
  { value: 'graduation',   label: 'Graduation' },
  { value: 'housewarming', label: 'Housewarming' },
  { value: 'anniversary',  label: 'Anniversary' },
  { value: 'other',        label: 'Other' },
];

function eventLabel(type: string) {
  return EVENT_TYPES.find(e => e.value === type)?.label ?? type;
}

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatPrice(p: number | null | undefined) {
  if (p == null) return null;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p);
}

const PRIORITY_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: '#FEE2E2', color: '#991B1B', label: 'High' },
  medium: { bg: '#FEF3C7', color: '#92400E', label: 'Medium' },
  low:    { bg: '#F3F4F6', color: '#6B7280', label: 'Low' },
};

// ─── Item Form ────────────────────────────────────────────────────────────────

interface ItemFormData {
  name: string;
  description: string;
  price: string;
  quantity: string;
  priority: 'low' | 'medium' | 'high';
  product_url: string;
  image_url: string;
}

const emptyItem: ItemFormData = {
  name: '', description: '', price: '', quantity: '1',
  priority: 'medium', product_url: '', image_url: '',
};

function itemToForm(item: RegistryItem): ItemFormData {
  return {
    name: item.name,
    description: item.description ?? '',
    price: item.price != null ? String(item.price) : '',
    quantity: String(item.quantity),
    priority: item.priority,
    product_url: item.product_url ?? '',
    image_url: item.image_url ?? '',
  };
}

function ItemForm({ initial, onSubmit, onCancel, submitLabel = 'Add item' }: {
  initial?: Partial<ItemFormData>;
  onSubmit: (data: ItemFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<ItemFormData>({ ...emptyItem, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  function set<K extends keyof ItemFormData>(key: K, value: ItemFormData[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function validate() {
    const e: Partial<Record<keyof ItemFormData, string>> = {};
    if (!form.name.trim()) e.name = 'Item name is required.';
    const qty = parseInt(form.quantity);
    if (!form.quantity || isNaN(qty) || qty < 1) e.quantity = 'Quantity must be at least 1.';
    if (form.price && isNaN(parseFloat(form.price))) e.price = 'Enter a valid price.';
    if (form.product_url && !/^https?:\/\//i.test(form.product_url)) e.product_url = 'Must start with http:// or https://';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { await onSubmit(form); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">Item name *</label>
        <input className={`input${errors.name ? ' error' : ''}`} value={form.name}
          onChange={e => set('name', e.target.value)} placeholder="e.g. KitchenAid Stand Mixer" />
        {errors.name && <p className="form-error">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="input" style={{ minHeight: 72, resize: 'vertical' }}
          value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Colour preference, model, or notes for guests…" />
      </div>

      <div className={s.formRow}>
        <div className="form-group">
          <label className="form-label">Price (IDR)</label>
          <input className={`input${errors.price ? ' error' : ''}`} type="number" min="0"
            value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" />
          {errors.price && <p className="form-error">{errors.price}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Quantity needed *</label>
          <input className={`input${errors.quantity ? ' error' : ''}`} type="number" min="1"
            value={form.quantity} onChange={e => set('quantity', e.target.value)} />
          {errors.quantity && <p className="form-error">{errors.quantity}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Priority</label>
        <div className={s.priorityPicker}>
          {(['low', 'medium', 'high'] as const).map(p => {
            const st = PRIORITY_STYLES[p];
            const active = form.priority === p;
            return (
              <button key={p} type="button" onClick={() => set('priority', p)} style={{
                padding: '7px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem',
                fontFamily: 'var(--font-body)', cursor: 'pointer', fontWeight: 500,
                border: active ? `2px solid ${st.color}` : '2px solid var(--border)',
                background: active ? st.bg : 'transparent',
                color: active ? st.color : 'var(--muted)',
                transition: 'all 0.12s',
              }}>
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Product URL</label>
        <input className={`input${errors.product_url ? ' error' : ''}`}
          value={form.product_url} onChange={e => set('product_url', e.target.value)}
          placeholder="https://tokopedia.com/…" />
        {errors.product_url && <p className="form-error">{errors.product_url}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Image URL</label>
        <input className="input" value={form.image_url}
          onChange={e => set('image_url', e.target.value)} placeholder="https://…" />
      </div>

      <div className={s.formActions}>
        <button type="button" onClick={onCancel} className="btn btn-outline">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? <span className="spinner" /> : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function ItemCard({ item, onEdit, onDelete, onToggle }: {
  item: RegistryItem; onEdit: () => void; onDelete: () => void; onToggle: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  // Reset error state whenever the image URL changes (e.g. after an edit)
  useEffect(() => {
    setImgError(false);
  }, [item.image_url]);

  const pri = PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.low;
  const booked = item.quantity - item.quantity_remaining;
  const available = item.quantity - booked;
  const fullyBooked = available <= 0;

  return (
    <div className={`${s.itemCard} ${item.is_purchased || fullyBooked ? s.itemCardDone : ''}`}>
      {item.image_url && !imgError && (
        <div className={s.itemImg}>
          <img
            src={item.image_url}
            alt={item.name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div className={s.itemBody}>
        <div className={s.itemTopRow}>
          <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 600, background: pri.bg, color: pri.color }}>
            {pri.label}
          </span>
          {(item.is_purchased || fullyBooked) && (
            <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 600, background: 'var(--success-bg)', color: 'var(--success)' }}>
              {item.is_purchased ? 'Purchased' : 'Fully booked'}
            </span>
          )}
        </div>

        <h3 className={s.itemName}>{item.name}</h3>
        {item.description && <p className={s.itemDesc}>{item.description}</p>}

        <div className={s.itemMeta}>
          {formatPrice(item.price) && <span className={s.itemPrice}>{formatPrice(item.price)}</span>}
          <span className={s.itemQty}>{booked}/{item.quantity} booked</span>
        </div>

        {item.product_url && (
          <a href={item.product_url} target="_blank" rel="noopener noreferrer" className={s.productLink}>
            View product ↗
          </a>
        )}
      </div>

      <div className={s.itemActions}>
        <button
          onClick={onToggle}
          className={`${s.iconBtn} ${item.is_purchased ? s.iconBtnActive : ''}`}
          title={item.is_purchased ? 'Unmark as purchased' : 'Mark as purchased'}
        >
          ✓
        </button>
        <button onClick={onEdit} className={s.iconBtn} title="Edit">✎</button>
        <button onClick={onDelete} className={`${s.iconBtn} ${s.iconBtnDanger}`} title="Delete">🗑</button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegistryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [registry, setRegistry] = useState<Registry | null>(null);
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<RegistryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<RegistryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const rid = parseInt(id);
    Promise.all([
      registryApi.get(rid),
      registryApi.getItems(rid),
    ]).then(([regRes, itmsRes]) => {
      setRegistry(unwrap<Registry>(regRes));
      const list = unwrap<RegistryItem[]>(itmsRes);
      setItems(Array.isArray(list) ? list : []);
    }).catch(() => toast('Failed to load registry.', 'error'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, id]); // eslint-disable-line

  function copyShareLink() {
    if (!registry) return;
    navigator.clipboard.writeText(`${window.location.origin}/r/${registry.slug}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleAddItem(form: ItemFormData) {
    try {
      const res = await registryApi.createItem(parseInt(id), {
        name: form.name,
        description: form.description || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        quantity: parseInt(form.quantity),
        priority: form.priority,
        product_url: form.product_url || undefined,
        image_url: form.image_url || undefined,
      });
      const item = unwrap<RegistryItem>(res);
      setItems(prev => [...prev, item]);
      toast('Item added!');
      setAddOpen(false);
    } catch {
      toast('Failed to add item.', 'error');
    }
  }

  async function handleEditItem(form: ItemFormData) {
    if (!editItem) return;
    try {
      const res = await registryApi.updateItem(parseInt(id), editItem.id, {
        name: form.name,
        description: form.description || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        quantity: parseInt(form.quantity),
        priority: form.priority,
        product_url: form.product_url || undefined,
        image_url: form.image_url || undefined,
      });
      const updated = unwrap<RegistryItem>(res);
      // Replace by numeric ID comparison to handle string/number mismatch
      setItems(prev => prev.map(i => sameId(i.id, updated.id) ? updated : i));
      toast('Item updated!');
      setEditItem(null);
    } catch {
      toast('Failed to update item.', 'error');
    }
  }

  async function handleDeleteItem() {
    if (!deleteItem) return;
    setDeletingItem(true);
    try {
      await registryApi.deleteItem(parseInt(id), deleteItem.id);
      setItems(prev => prev.filter(i => !sameId(i.id, deleteItem.id)));
      toast('Item removed.');
      setDeleteItem(null);
    } catch {
      toast('Failed to delete item.', 'error');
    } finally {
      setDeletingItem(false);
    }
  }

  async function handleTogglePurchased(item: RegistryItem) {
    // Optimistically flip before the API responds so the UI is instant
    const nextState = !item.is_purchased;
    setItems(prev => prev.map(i =>
      sameId(i.id, item.id) ? { ...i, is_purchased: nextState } : i
    ));
    toast(nextState ? 'Marked as purchased.' : 'Unmarked as purchased.', 'info');

    try {
      const res = await registryApi.togglePurchased(parseInt(id), item.id);
      const updated = unwrap<RegistryItem>(res);
      // If API returned a full item object, sync with server truth
      if (updated?.id != null) {
        setItems(prev => prev.map(i => sameId(i.id, updated.id) ? updated : i));
      }
    } catch {
      // Revert on error
      setItems(prev => prev.map(i =>
        sameId(i.id, item.id) ? { ...i, is_purchased: item.is_purchased } : i
      ));
      toast('Failed to update item.', 'error');
    }
  }

  if (authLoading || loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner spinner-dark" /></div>;
  }

  if (!registry) {
    return (
      <div className={s.page}>
        <Navbar />
        <main className={s.main}>
          <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 12 }}>Registry not found</h1>
            <Link href="/dashboard" className="btn btn-primary">Back to dashboard</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalCount    = items.reduce((sum, i) => sum + i.quantity, 0);
  const claimedCount  = items.reduce((sum, i) => sum + (i.is_purchased ? 0 : i.quantity - i.quantity_remaining), 0);
  const totalClaimedCount    = items.reduce((sum, i) => sum + (i.is_purchased ? 0 : i.quantity), 0); 
  const purchasedCount = items.reduce((sum, i) => sum + (i.is_purchased ? i.quantity : 0), 0);
  const totalPurchasedCount    = items.reduce((sum, i) => sum + (i.is_purchased ? i.quantity : 0), 0); 

  return (
    <div className={s.page}>
      <Navbar />
      <main className={s.main}>
        <div className="container">
          <Link href="/dashboard" className={s.backLink}>← My Registries</Link>

          <div className={s.registryHeader}>
            <div className={s.registryInfo}>
              <div className={s.registryMeta}>
                <span className={`${s.badge} ${registry.is_public ? s.badgePublic : s.badgePrivate}`}>
                  {registry.is_public ? 'Public' : 'Private'}
                </span>
                <span className={s.metaText}>{eventLabel(registry.event_type)}</span>
                {registry.event_date && <span className={s.metaText}>· {formatDate(registry.event_date)}</span>}
              </div>
              <h1 className={s.registryTitle}>{registry.title}</h1>
              {registry.description && <p className={s.registryDesc}>{registry.description}</p>}
              <p className={s.registryStats}>{items.length} gifts · {claimedCount} of {totalClaimedCount} items claimed · {purchasedCount} of {totalPurchasedCount} gifts purchased</p>
            </div>

            <div className={s.registryActions}>
              <button onClick={copyShareLink} className="btn btn-outline">
                {copied ? '✓ Copied!' : '🔗 Share link'}
              </button>
              <Link href={`/r/${registry.slug}`} target="_blank" className="btn btn-outline">
                Preview ↗
              </Link>
            </div>
          </div>

          <div className={s.itemsHeader}>
            <h2 className={s.sectionTitle}>Items ({items.length})</h2>
            <button onClick={() => setAddOpen(true)} className="btn btn-primary">+ Add item</button>
          </div>

          {items.length === 0 ? (
            <div className={s.emptyItems}>
              <p className={s.emptyText}>No items yet. Add your first gift to this registry.</p>
              <button onClick={() => setAddOpen(true)} className="btn btn-outline">+ Add your first item</button>
            </div>
          ) : (
            <div className={s.itemGrid}>
              {items.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => setEditItem(item)}
                  onDelete={() => setDeleteItem(item)}
                  onToggle={() => handleTogglePurchased(item)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add item" size="md">
        <ItemForm onSubmit={handleAddItem} onCancel={() => setAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit item" size="md">
        {editItem && (
          <ItemForm initial={itemToForm(editItem)} onSubmit={handleEditItem} onCancel={() => setEditItem(null)} submitLabel="Save changes" />
        )}
      </Modal>

      <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Remove item" size="sm">
        {deleteItem && (
          <div>
            <p style={{ color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
              Remove <strong style={{ color: 'var(--primary)' }}>{deleteItem.name}</strong> from this registry?
            </p>
            <div className={s.formActions}>
              <button onClick={() => setDeleteItem(null)} className="btn btn-outline">Cancel</button>
              <button onClick={handleDeleteItem} disabled={deletingItem} className="btn"
                style={{ background: 'var(--error)', color: '#fff', borderColor: 'var(--error)' }}>
                {deletingItem ? <span className="spinner" /> : 'Remove item'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
