import type { User } from '@/lib/api';

// ─── Stored shapes (derived booking fields are computed on read) ──────────────

export interface StoredRegistry {
  id: number; title: string; slug: string; description: string | null;
  event_type: string; event_date: string | null; cover_image_url: string | null;
  is_public: boolean; created_at: string; updated_at: string;
}

export interface StoredItem {
  id: number; registry_id: number; name: string; description: string | null;
  price: number | null; quantity: number; priority: 'low' | 'medium' | 'high';
  image_url: string | null; product_url: string | null; is_purchased: boolean;
  created_at: string;
}

export interface StoredBooking {
  uuid: string; item_id: number; booker_name: string; booker_email: string;
  quantity_booked: number; note: string | null; created_at: string;
}

export interface DemoDb {
  version: number;
  user: User;
  registries: StoredRegistry[];
  items: StoredItem[];
  bookings: StoredBooking[];
  nextId: { registry: number; item: number };
}

export const DB_VERSION = 1;

export const DEMO_USER: User = {
  id: 1,
  name: 'Alex Morgan',
  username: 'alexmorgan',
  email: 'demo@mygiftlist.app',
  phone: '081234567890',
};

// Dates are relative to the moment the demo is seeded so events never look stale
function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function timestamp(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

const img = (name: string) => `/demo/items/${name}.svg`;

export function buildSeed(): DemoDb {
  const registries: StoredRegistry[] = [
    {
      id: 1,
      title: "Sarah & James' Wedding",
      slug: 'sarah-and-james-wedding',
      description: 'We are so excited to celebrate our big day with you! Your presence is the greatest gift, but if you would like to give something, here are a few things that would help us start our life together.',
      event_type: 'wedding',
      event_date: daysFromNow(75),
      cover_image_url: null,
      is_public: true,
      created_at: timestamp(30),
      updated_at: timestamp(2),
    },
    {
      id: 2,
      title: "Baby Mia's Welcome Shower",
      slug: 'baby-mia-shower',
      description: 'Little Mia is on her way! Help us get ready for her arrival.',
      event_type: 'baby_shower',
      event_date: daysFromNow(28),
      cover_image_url: null,
      is_public: true,
      created_at: timestamp(14),
      updated_at: timestamp(1),
    },
    {
      id: 3,
      title: 'Our New Home',
      slug: 'our-new-home',
      description: 'A private list for our housewarming. Still deciding what to add before sharing it.',
      event_type: 'housewarming',
      event_date: daysFromNow(120),
      cover_image_url: null,
      is_public: false,
      created_at: timestamp(5),
      updated_at: timestamp(5),
    },
  ];

  const item = (
    id: number, registry_id: number, name: string, description: string,
    price: number, quantity: number, priority: StoredItem['priority'],
    image: string, is_purchased = false,
  ): StoredItem => ({
    id, registry_id, name, description, price, quantity, priority,
    image_url: img(image), product_url: null, is_purchased, created_at: timestamp(20 - id),
  });

  const items: StoredItem[] = [
    item(1, 1, 'Stand Mixer', 'Tilt-head stand mixer in almond cream, for weekend baking.', 7500000, 1, 'high', 'stand-mixer'),
    item(2, 1, 'Cast Iron Dutch Oven', '5.3L enamelled cast iron pot, any colour.', 5200000, 1, 'high', 'dutch-oven'),
    item(3, 1, 'Cotton Bed Sheet Set', 'Queen size, 400 thread count, white or sage.', 1800000, 2, 'medium', 'bed-sheets'),
    item(4, 1, 'Espresso Machine', 'Capsule espresso machine with milk frother.', 3200000, 1, 'medium', 'coffee-machine', true),
    item(5, 1, 'Crystal Wine Glasses (set of 6)', 'Lead-free crystal, dishwasher safe.', 950000, 2, 'low', 'wine-glasses'),
    item(6, 1, 'Cordless Vacuum Cleaner', 'Lightweight stick vacuum for our new apartment.', 8900000, 1, 'high', 'vacuum'),
    item(7, 1, 'Honeymoon Fund — Bali', 'Each unit covers a dinner, a tour, or a spa day on our honeymoon.', 500000, 10, 'medium', 'honeymoon'),

    item(8, 2, 'Travel System Stroller', 'Stroller with matching infant car seat.', 4500000, 1, 'high', 'stroller'),
    item(9, 2, 'Video Baby Monitor', 'Wi-Fi monitor with night vision.', 1600000, 1, 'medium', 'baby-monitor'),
    item(10, 2, 'Diaper Bundle', 'Newborn and size 1 diapers, any brand.', 250000, 6, 'high', 'diapers'),
    item(11, 2, 'Plush Toy Set', 'Soft, washable toys for the nursery.', 300000, 1, 'low', 'teddy-bear'),
    item(12, 2, 'Ergonomic Baby Carrier', 'Front and back carry, 0–36 months.', 1200000, 1, 'medium', 'baby-carrier'),

    item(13, 3, 'Indoor Plant Set', 'Three low-maintenance plants with ceramic pots.', 450000, 3, 'low', 'plants'),
    item(14, 3, 'Air Fryer', '5.5L digital air fryer.', 1500000, 1, 'medium', 'air-fryer'),
    item(15, 3, 'Wooden Bookshelf', 'Five-tier oak bookshelf for the living room.', 2000000, 1, 'low', 'bookshelf'),
  ];

  const booking = (
    uuid: string, item_id: number, booker_name: string, quantity_booked: number, note: string | null, daysAgo: number,
  ): StoredBooking => ({
    uuid, item_id, booker_name, quantity_booked, note,
    booker_email: `${booker_name.split(' ')[0].toLowerCase()}@example.com`,
    created_at: timestamp(daysAgo),
  });

  const bookings: StoredBooking[] = [
    booking('2f6c1d0e-5b7a-4c1e-9a3d-1b2c3d4e5f01', 1, 'Rina Putri', 1, 'Congratulations, you two!', 6),
    booking('2f6c1d0e-5b7a-4c1e-9a3d-1b2c3d4e5f02', 3, 'Budi Santoso', 1, null, 4),
    booking('2f6c1d0e-5b7a-4c1e-9a3d-1b2c3d4e5f03', 7, 'Dewi Lestari', 2, 'Enjoy Bali!', 3),
    booking('2f6c1d0e-5b7a-4c1e-9a3d-1b2c3d4e5f04', 7, 'Andi Wijaya', 1, null, 1),
    booking('2f6c1d0e-5b7a-4c1e-9a3d-1b2c3d4e5f05', 8, 'Grandma Siti', 1, 'For my first great-grandchild.', 5),
    booking('2f6c1d0e-5b7a-4c1e-9a3d-1b2c3d4e5f06', 10, 'Maya Kusuma', 4, null, 2),
  ];

  return {
    version: DB_VERSION,
    user: { ...DEMO_USER },
    registries,
    items,
    bookings,
    nextId: { registry: 4, item: 16 },
  };
}
