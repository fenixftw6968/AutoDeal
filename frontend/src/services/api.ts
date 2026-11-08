import { AuthResponse, Campaign, Car, ChatMessage, DealerOffer, User } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('autodeal_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.message || errData.error || JSON.stringify(errData);
    } catch {
      errorMsg = response.statusText || `${response.status}`;
    }
    throw new Error(errorMsg);
  }

  // If 204 or empty
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth API
export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => request<User>('/auth/me'),
    updateProfile: (profile: any) =>
      request<User>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      }),
  },

  campaigns: {
    getAll: (params?: { brand?: string; model?: string; city?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.brand) query.append('brand', params.brand);
      if (params?.model) query.append('model', params.model);
      if (params?.city) query.append('city', params.city);
      if (params?.status) query.append('status', params.status);
      const qStr = query.toString() ? `?${query.toString()}` : '';
      return request<Campaign[]>(`/campaigns${qStr}`);
    },
    getFeatured: () => request<Campaign[]>('/campaigns/featured'),
    getById: (id: string) => request<Campaign>(`/campaigns/${id}`),
    create: (data: any) =>
      request<Campaign>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    join: (id: string, preferredColor?: string) =>
      request<Campaign>(`/campaigns/${id}/join`, {
        method: 'POST',
        body: JSON.stringify({ preferredColor }),
      }),
    leave: (id: string) =>
      request<Campaign>(`/campaigns/${id}/leave`, {
        method: 'POST',
      }),
    getJoined: () => request<Campaign[]>('/campaigns/user/joined'),
  },

  offers: {
    getByCampaign: (campaignId: string) => request<DealerOffer[]>(`/offers/campaign/${campaignId}`),
    getComparison: (campaignId: string) => request<any[]>(`/offers/campaign/${campaignId}/comparison`),
    submit: (data: any) =>
      request<DealerOffer>('/offers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyOffers: () => request<DealerOffer[]>('/offers/my-offers'),
    withdraw: (offerId: string) =>
      request<DealerOffer>(`/offers/${offerId}`, {
        method: 'DELETE',
      }),
  },

  chat: {
    getRecent: (campaignId: string) => request<ChatMessage[]>(`/campaigns/${campaignId}/chat/messages`),
    sendMessage: (campaignId: string, content: string) =>
      request<ChatMessage>(`/campaigns/${campaignId}/chat/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  },

  cars: {
    getAll: (brand?: string) => {
      const q = brand ? `?brand=${encodeURIComponent(brand)}` : '';
      return request<Car[]>(`/cars${q}`);
    },
  },
};
