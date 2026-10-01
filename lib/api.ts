// ─── Demo build ───────────────────────────────────────────────────────────────
// This version of the app has no backend. Every call below is served by an
// in-browser store (see lib/demo/store.ts) seeded with a demo account,
// registries, items and bookings. Any well-formed email + any password logs in.

import {
  simulate, fail, newUuid, findRegistry, findItem, assertUniqueSlug, toRegistry, toItem,
} from './demo/store';

const DEMO_TOKEN = 'demo-access-token';

// Optional nullable fields: a key that is present but undefined means "cleared"
function nullable<T>(payload: object, key: string, current: T | null): T | null {
  return key in payload ? ((payload as Record<string, T | undefined>)[key] ?? null) : current;
}

function now() {
  return new Date().toISOString();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number; name: string; username: string; email: string; phone: string;
}

export interface LoginResponse {
  access_token?: string; token?: string; user: User;
}

export interface Registry {
  id: number; title: string; slug: string; description: string | null;
  event_type: string; event_date: string | null; cover_image_url: string | null;
  is_public: boolean; created_at: string; updated_at: string;
}

export interface RegistryItem {
  id: number; name: string; description: string | null; price: number | null;
  quantity: number; quantity_remaining: number; priority: 'low' | 'medium' | 'high'; image_url: string | null;
  product_url: string | null; is_purchased: boolean; quantity_booked: number;
  created_at: string; is_fully_booked: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  // Registering just personalises the demo account; the demo data stays the same
  register: (payload: { name: string; username: string; email: string; password: string; password_confirmation: string; phone: string }) =>
    simulate<LoginResponse>(db => {
      db.user = { ...db.user, name: payload.name, username: payload.username, email: payload.email, phone: payload.phone };
      return { access_token: DEMO_TOKEN, user: db.user };
    }),

  login: (payload: { email: string; password: string }) =>
    simulate<LoginResponse>(db => {
      if (!/\S+@\S+\.\S+/.test(payload.email) || !payload.password) {
        fail(422, 'Enter a valid email address and any password.');
      }
      return { access_token: DEMO_TOKEN, user: db.user };
    }),

  forgotPassword: (email: string) =>
    simulate<{ message: string }>(() => ({
      message: `Demo mode: no email was sent to ${email}. Any password works on the login page.`,
    })),

  resetPassword: (payload: { token: string; email: string; password: string; password_confirmation: string }) =>
    simulate<{ message: string }>(() => ({
      message: `Demo mode: the password for ${payload.email} has been "reset". Any password works on the login page.`,
    })),

  me: () => simulate<User>(db => db.user),

  logout: () => simulate<{ message: string }>(() => ({ message: 'Logged out.' })),
};

// ─── Registries ───────────────────────────────────────────────────────────────

export const registryApi = {
  list: () => simulate<Registry[]>(db => db.registries.map(toRegistry)),

  create: (payload: {
    title: string; slug: string; description?: string; event_type: string;
    event_date?: string; cover_image_url?: string | null; is_public: boolean;
  }) => simulate<Registry>(db => {
    assertUniqueSlug(db, payload.slug);
    const reg = {
      id: db.nextId.registry++,
      title: payload.title,
      slug: payload.slug,
      description: payload.description ?? null,
      event_type: payload.event_type,
      event_date: payload.event_date ?? null,
      cover_image_url: payload.cover_image_url ?? null,
      is_public: payload.is_public,
      created_at: now(),
      updated_at: now(),
    };
    db.registries.push(reg);
    return toRegistry(reg);
  }),

  get: (id: number) => simulate<Registry>(db => toRegistry(findRegistry(db, id))),

  update: (id: number, payload: Partial<Registry>) =>
    simulate<Registry>(db => {
      const reg = findRegistry(db, id);
      if (payload.slug !== undefined) assertUniqueSlug(db, payload.slug, reg.id);
      Object.assign(reg, {
        title: payload.title ?? reg.title,
        slug: payload.slug ?? reg.slug,
        event_type: payload.event_type ?? reg.event_type,
        is_public: payload.is_public ?? reg.is_public,
        description: nullable(payload, 'description', reg.description),
        event_date: nullable(payload, 'event_date', reg.event_date),
        cover_image_url: nullable(payload, 'cover_image_url', reg.cover_image_url),
        updated_at: now(),
      });
      return toRegistry(reg);
    }),

  delete: (id: number) =>
    simulate<{ message: string }>(db => {
      const reg = findRegistry(db, id);
      const itemIds = new Set(db.items.filter(i => i.registry_id === reg.id).map(i => i.id));
      db.bookings = db.bookings.filter(b => !itemIds.has(b.item_id));
      db.items = db.items.filter(i => i.registry_id !== reg.id);
      db.registries = db.registries.filter(r => r.id !== reg.id);
      return { message: 'Registry deleted.' };
    }),

  getItems: (registryId: number) =>
    simulate<RegistryItem[]>(db => {
      const reg = findRegistry(db, registryId);
      return db.items.filter(i => i.registry_id === reg.id).map(i => toItem(db, i));
    }),

  createItem: (registryId: number, payload: {
    name: string; description?: string; price?: number; quantity: number;
    priority: 'low' | 'medium' | 'high'; image_url?: string | null; product_url?: string | null;
  }) => simulate<RegistryItem>(db => {
    const reg = findRegistry(db, registryId);
    const item = {
      id: db.nextId.item++,
      registry_id: reg.id,
      name: payload.name,
      description: payload.description ?? null,
      price: payload.price ?? null,
      quantity: payload.quantity,
      priority: payload.priority,
      image_url: payload.image_url ?? null,
      product_url: payload.product_url ?? null,
      is_purchased: false,
      created_at: now(),
    };
    db.items.push(item);
    return toItem(db, item);
  }),

  updateItem: (registryId: number, itemId: number, payload: Partial<RegistryItem>) =>
    simulate<RegistryItem>(db => {
      const item = findItem(db, registryId, itemId);
      const booked = toItem(db, item).quantity_booked;
      if (payload.quantity !== undefined && payload.quantity < booked) {
        fail(422, `Quantity can't be lower than the ${booked} already booked.`);
      }
      Object.assign(item, {
        name: payload.name ?? item.name,
        quantity: payload.quantity ?? item.quantity,
        priority: payload.priority ?? item.priority,
        description: nullable(payload, 'description', item.description),
        price: nullable(payload, 'price', item.price),
        image_url: nullable(payload, 'image_url', item.image_url),
        product_url: nullable(payload, 'product_url', item.product_url),
      });
      return toItem(db, item);
    }),

  deleteItem: (registryId: number, itemId: number) =>
    simulate<{ message: string }>(db => {
      const item = findItem(db, registryId, itemId);
      db.bookings = db.bookings.filter(b => b.item_id !== item.id);
      db.items = db.items.filter(i => i.id !== item.id);
      return { message: 'Item deleted.' };
    }),

  togglePurchased: (registryId: number, itemId: number) =>
    simulate<RegistryItem>(db => {
      const item = findItem(db, registryId, itemId);
      item.is_purchased = !item.is_purchased;
      return toItem(db, item);
    }),
};

// ─── Public (no auth) ─────────────────────────────────────────────────────────

export const publicApi = {
  getRegistry: (slug: string) =>
    simulate<{ registry: Registry; items: RegistryItem[] }>(db => {
      const reg = db.registries.find(r => r.slug === slug && r.is_public);
      if (!reg) fail(404, 'Registry not found.');
      return {
        registry: toRegistry(reg),
        items: db.items.filter(i => i.registry_id === reg.id).map(i => toItem(db, i)),
      };
    }),

  bookItem: (slug: string, itemId: number, payload: {
    booker_name: string; booker_email: string; quantity_booked: number; note?: string;
  }) => simulate<Record<string, unknown>>(db => {
    const reg = db.registries.find(r => r.slug === slug && r.is_public);
    if (!reg) fail(404, 'Registry not found.');
    const item = findItem(db, reg.id, itemId);
    const { quantity_remaining } = toItem(db, item);
    if (item.is_purchased) fail(422, 'This gift has already been purchased.');
    if (payload.quantity_booked < 1 || payload.quantity_booked > quantity_remaining) {
      fail(422, `Only ${quantity_remaining} available.`);
    }
    const booking = {
      uuid: newUuid(),
      item_id: item.id,
      booker_name: payload.booker_name,
      booker_email: payload.booker_email,
      quantity_booked: payload.quantity_booked,
      note: payload.note ?? null,
      created_at: now(),
    };
    db.bookings.push(booking);
    return { ...booking, booking_id: booking.uuid };
  }),

  cancelBooking: (uuid: string) =>
    simulate<{ message: string }>(db => {
      if (!db.bookings.some(b => b.uuid === uuid)) fail(404, 'Booking not found.');
      db.bookings = db.bookings.filter(b => b.uuid !== uuid);
      return { message: 'Your booking has been cancelled. The gift is available for others again.' };
    }),
};
