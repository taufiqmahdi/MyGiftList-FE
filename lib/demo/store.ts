import type { Registry, RegistryItem } from '@/lib/api';
import { buildSeed, DB_VERSION, DemoDb, StoredItem, StoredRegistry } from './seed';

// ─── In-browser "backend" for the demo build ──────────────────────────────────
// All data lives in localStorage, so every visitor gets their own sandbox.

const STORAGE_KEY = 'mgl_demo_db';
const LATENCY_MS = 250;

// Fallback for when localStorage is unavailable (private mode, blocked storage)
let memoryDb: DemoDb | null = null;

export function loadDb(): DemoDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoDb;
      if (parsed.version === DB_VERSION) return parsed;
    }
  } catch {
    if (memoryDb) return memoryDb;
  }
  const seeded = buildSeed();
  saveDb(seeded);
  return seeded;
}

export function saveDb(db: DemoDb) {
  memoryDb = db;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // keep the in-memory copy only
  }
}

export function resetDb() {
  saveDb(buildSeed());
}

/** Runs a handler against the db after a short delay so loading states are visible. */
export function simulate<T>(handler: (db: DemoDb) => T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const db = loadDb();
        const result = handler(db);
        saveDb(db);
        // Hand back copies so callers can't mutate the store by accident
        resolve(result === undefined ? result : structuredClone(result));
      } catch (err) {
        reject(err);
      }
    }, LATENCY_MS);
  });
}

/** Throws in the same `{ status, data }` shape as the real API client. */
export function fail(status: number, message: string, errors?: Record<string, string[]>): never {
  throw { status, data: { message, ...(errors ? { errors } : {}) } };
}

export function newUuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── Lookups & serialisers ────────────────────────────────────────────────────

export function findRegistry(db: DemoDb, id: number): StoredRegistry {
  const reg = db.registries.find(r => r.id === Number(id));
  if (!reg) fail(404, 'Registry not found.');
  return reg;
}

export function findItem(db: DemoDb, registryId: number, itemId: number): StoredItem {
  const item = db.items.find(i => i.id === Number(itemId) && i.registry_id === Number(registryId));
  if (!item) fail(404, 'Item not found.');
  return item;
}

export function assertUniqueSlug(db: DemoDb, slug: string, exceptId?: number) {
  if (db.registries.some(r => r.slug === slug && r.id !== exceptId)) {
    fail(422, 'The slug has already been taken.', { slug: ['The slug has already been taken.'] });
  }
}

export function toRegistry(reg: StoredRegistry): Registry {
  return { ...reg };
}

export function toItem(db: DemoDb, item: StoredItem): RegistryItem {
  const quantity_booked = db.bookings
    .filter(b => b.item_id === item.id)
    .reduce((sum, b) => sum + b.quantity_booked, 0);
  const quantity_remaining = Math.max(0, item.quantity - quantity_booked);
  return {
    id: item.id, name: item.name, description: item.description, price: item.price,
    quantity: item.quantity, priority: item.priority, image_url: item.image_url,
    product_url: item.product_url, is_purchased: item.is_purchased, created_at: item.created_at,
    quantity_booked, quantity_remaining, is_fully_booked: quantity_remaining <= 0,
  };
}
