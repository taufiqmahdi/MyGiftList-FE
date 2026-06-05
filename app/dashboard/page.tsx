'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { registryApi, Registry } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Modal from '@/components/ui/Modal';
import s from './page.module.css';

// ─── Unwrap Laravel's { data: ... } wrapper ───────────────────────────────────
function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in (res as object)) {
    return (res as { data: T }).data;
  }
  return res as T;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Registry Form ────────────────────────────────────────────────────────────

interface RegistryFormData {
  title: string;
  slug: string;
  description: string;
  event_type: string;
  event_date: string;
  is_public: boolean;
}

const emptyForm: RegistryFormData = {
  title: '', slug: '', description: '', event_type: 'wedding', event_date: '', is_public: true,
};

interface RegistryFormProps {
  initial?: Partial<RegistryFormData>;
  onSubmit: (data: RegistryFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

function RegistryForm({ initial, onSubmit, onCancel, submitLabel = 'Create registry' }: RegistryFormProps) {
  const [form, setForm] = useState<RegistryFormData>({ ...emptyForm, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistryFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  function set<K extends keyof RegistryFormData>(key: K, value: RegistryFormData[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleTitleChange(v: string) {
    set('title', v);
    if (!slugTouched) set('slug', slugify(v));
  }

  function validate() {
    const e: Partial<Record<keyof RegistryFormData, string>> = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.slug.trim()) e.slug = 'Slug is required.';
    else if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Only lowercase letters, numbers, and dashes.';
    if (!form.event_type) e.event_type = 'Please select an event type.';
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
        <label className="form-label">Registry title *</label>
        <input
          className={`input${errors.title ? ' error' : ''}`}
          value={form.title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Jane & John's Wedding Registry"
        />
        {errors.title && <p className="form-error">{errors.title}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">
          URL slug *
          <span style={{ fontWeight: 400, color: 'var(--muted)', marginLeft: 6, fontSize: '0.8rem' }}>
            — /r/<strong>{form.slug || '…'}</strong>
          </span>
        </label>
        <input
          className={`input${errors.slug ? ' error' : ''}`}
          value={form.slug}
          onChange={e => { setSlugTouched(true); set('slug', e.target.value); }}
          placeholder="jane-john-wedding"
        />
        {errors.slug && <p className="form-error">{errors.slug}</p>}
      </div>

      <div className={s.formRow}>
        <div className="form-group">
          <label className="form-label">Event type *</label>
          <select
            className={`input${errors.event_type ? ' error' : ''}`}
            value={form.event_type}
            onChange={e => set('event_type', e.target.value)}
          >
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {errors.event_type && <p className="form-error">{errors.event_type}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Event date</label>
          <input type="date" className="input" value={form.event_date} onChange={e => set('event_date', e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="input" style={{ minHeight: 80, resize: 'vertical' }}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="A short note for your guests…"
        />
      </div>

      <div className={s.toggleRow}>
        <label className={s.toggleLabel}>
          <span>Public registry</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>Anyone with the link can view it</span>
        </label>
        <button
          type="button"
          onClick={() => set('is_public', !form.is_public)}
          className={`${s.toggle} ${form.is_public ? s.toggleOn : ''}`}
          aria-pressed={form.is_public}
        >
          <span className={s.toggleThumb} />
        </button>
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

// ─── Registry Card ────────────────────────────────────────────────────────────

function RegistryCard({ registry, onEdit, onDelete }: {
  registry: Registry; onEdit: () => void; onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/r/${registry.slug}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={s.card}>
      <div className={s.cardHeader}>
        <span className={`${s.badge} ${registry.is_public ? s.badgePublic : s.badgePrivate}`}>
          {registry.is_public ? 'Public' : 'Private'}
        </span>
        <span className={s.eventType}>{eventLabel(registry.event_type)}</span>
      </div>

      <h2 className={s.cardTitle}>{registry.title}</h2>
      {registry.description && <p className={s.cardDesc}>{registry.description}</p>}
      {registry.event_date && <p className={s.cardMeta}>📅 {formatDate(registry.event_date)}</p>}

      <div className={s.cardFooter}>
        <Link href={`/dashboard/registries/${registry.id}`} className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '7px 16px' }}>
          Manage
        </Link>
        <button onClick={copyLink} className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '7px 14px' }}>
          {copied ? '✓ Copied' : '🔗 Share'}
        </button>
        {/* Group keeps edit + delete together */}
        <div className={s.iconBtnGroup}>
          <button onClick={onEdit} className={s.iconBtn} title="Edit">✎</button>
          <button onClick={onDelete} className={`${s.iconBtn} ${s.iconBtnDanger}`} title="Delete">🗑</button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────

function ConfirmDelete({ name, onConfirm, onCancel, loading }: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div>
      <p style={{ color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
        Are you sure you want to delete <strong style={{ color: 'var(--primary)' }}>{name}</strong>?
        This will remove all items and bookings. This action cannot be undone.
      </p>
      <div className={s.formActions}>
        <button onClick={onCancel} className="btn btn-outline">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="btn"
          style={{ background: 'var(--error)', color: '#fff', borderColor: 'var(--error)' }}>
          {loading ? <span className="spinner" /> : 'Delete registry'}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [registries, setRegistries] = useState<Registry[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Registry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Registry | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    registryApi.list()
      .then(res => {
        const list = unwrap<Registry[]>(res);
        setRegistries(Array.isArray(list) ? list : []);
      })
      .catch(() => toast('Failed to load registries.', 'error'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]); // eslint-disable-line

  async function handleCreate(form: RegistryFormData) {
    try {
      const res = await registryApi.create({
        ...form,
        event_date: form.event_date || undefined,
        description: form.description || undefined,
        cover_image_url: null,
      });
      const created = unwrap<Registry>(res);
      toast('Registry created!');
      setCreateOpen(false);
      router.push(`/dashboard/registries/${created.id}`);
    } catch {
      toast('Failed to create registry.', 'error');
    }
  }

  async function handleEdit(form: RegistryFormData) {
    if (!editTarget) return;
    try {
      const res = await registryApi.update(editTarget.id, {
        ...form,
        event_date: form.event_date || undefined,
        description: form.description || undefined,
      });
      const updated = unwrap<Registry>(res);
      setRegistries(rs => rs.map(r => r.id === updated.id ? updated : r));
      toast('Registry updated!');
      setEditTarget(null);
    } catch {
      toast('Failed to update registry.', 'error');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await registryApi.delete(deleteTarget.id);
      setRegistries(rs => rs.filter(r => r.id !== deleteTarget.id));
      toast('Registry deleted.');
      setDeleteTarget(null);
    } catch {
      toast('Failed to delete registry.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  if (authLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner spinner-dark" /></div>;
  }

  return (
    <div className={s.page}>
      <Navbar />
      <main className={s.main}>
        <div className="container">
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.pageTitle}>My Registries</h1>
              <p className={s.pageSubtitle}>Create and manage your gift registries.</p>
            </div>
            <button onClick={() => setCreateOpen(true)} className="btn btn-primary">+ New Registry</button>
          </div>

          {loading ? (
            <div className={s.loadingState}><span className="spinner spinner-dark" /></div>
          ) : registries.length === 0 ? (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}>◎</div>
              <h2 className={s.emptyTitle}>No registries yet</h2>
              <p className={s.emptyText}>Create your first registry and share it with guests.</p>
              <button onClick={() => setCreateOpen(true)} className="btn btn-primary">Create your first registry</button>
            </div>
          ) : (
            <div className={s.grid}>
              {registries.map(r => (
                <RegistryCard key={r.id} registry={r} onEdit={() => setEditTarget(r)} onDelete={() => setDeleteTarget(r)} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Registry" size="md">
        <RegistryForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Registry" size="md">
        {editTarget && (
          <RegistryForm
            initial={{ title: editTarget.title, slug: editTarget.slug, description: editTarget.description ?? '', event_type: editTarget.event_type, event_date: editTarget.event_date ?? '', is_public: editTarget.is_public }}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Registry" size="sm">
        {deleteTarget && (
          <ConfirmDelete name={deleteTarget.title} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
        )}
      </Modal>
    </div>
  );
}
