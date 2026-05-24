const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw { status: response.status, data };
  }

  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
}

export interface LoginResponse {
  access_token?: string;
  token?: string;
  user: User;
}

export interface Registry {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  event_type: string;
  event_date: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegistryItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  image_url: string | null;
  product_url: string | null;
  is_purchased: boolean;
  quantity_booked: number;
  created_at: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (payload: {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
  }) =>
    apiRequest<LoginResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) =>
    apiRequest<{ message: string }>('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => apiRequest<User>('/api/v1/auth/me'),

  logout: () =>
    apiRequest<{ message: string }>('/api/v1/auth/logout', { method: 'POST' }),
};

// ─── Registries ──────────────────────────────────────────────────────────────

export const registryApi = {
  list: () => apiRequest<Registry[]>('/api/v1/registries'),

  create: (payload: {
    title: string;
    slug: string;
    description?: string;
    event_type: string;
    event_date?: string;
    cover_image_url?: string | null;
    is_public: boolean;
  }) =>
    apiRequest<Registry>('/api/v1/registries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  get: (id: number) => apiRequest<Registry>(`/api/v1/registries/${id}`),

  update: (id: number, payload: Partial<Registry>) =>
    apiRequest<Registry>(`/api/v1/registries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: number) =>
    apiRequest<{ message: string }>(`/api/v1/registries/${id}`, {
      method: 'DELETE',
    }),

  // ─── Registry Items ─────────────────────────────────────────────────────────

  getItems: (registryId: number) =>
    apiRequest<RegistryItem[]>(`/api/v1/registries/${registryId}/items`),

  createItem: (
    registryId: number,
    payload: {
      name: string;
      description?: string;
      price?: number;
      quantity: number;
      priority: 'low' | 'medium' | 'high';
      image_url?: string | null;
      product_url?: string | null;
    }
  ) =>
    apiRequest<RegistryItem>(`/api/v1/registries/${registryId}/items`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateItem: (registryId: number, itemId: number, payload: Partial<RegistryItem>) =>
    apiRequest<RegistryItem>(`/api/v1/registries/${registryId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteItem: (registryId: number, itemId: number) =>
    apiRequest<{ message: string }>(
      `/api/v1/registries/${registryId}/items/${itemId}`,
      { method: 'DELETE' }
    ),

  togglePurchased: (registryId: number, itemId: number) =>
    apiRequest<RegistryItem>(
      `/api/v1/registries/${registryId}/items/${itemId}/purchased`,
      { method: 'PATCH' }
    ),
};

// ─── Public Registry (no auth needed) ────────────────────────────────────────

export const publicApi = {
  getRegistry: (slug: string) =>
    apiRequest<{ registry: Registry; items: RegistryItem[] }>(`/api/v1/r/${slug}`),

  bookItem: (
    slug: string,
    itemId: number,
    payload: {
      booker_name: string;
      booker_email: string;
      quantity_booked: number;
      note?: string;
    }
  ) =>
    apiRequest<{ message: string; booking_id: string }>(
      `/api/v1/r/${slug}/items/${itemId}/book`,
      { method: 'POST', body: JSON.stringify(payload) }
    ),

  cancelBooking: (bookingId: string) =>
    apiRequest<{ message: string }>(`/api/v1/bookings/cancel/${bookingId}`, {
      method: 'DELETE',
    }),
};
