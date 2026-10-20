import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token from localStorage
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('bmp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor for 401 handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token if expired
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('bmp_token');
        localStorage.removeItem('bmp_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: credentials => api.post('/auth/login', credentials),
  registerCustomer: data => api.post('/auth/register-customer', data),
  registerOwner: data => api.post('/auth/register-owner', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: data => api.put('/auth/profile', data),
};

export const venueAPI = {
  getVenues: params => api.get('/venues', { params }),
  getNearMe: params => api.get('/venues/near-me', { params }),
  autocomplete: query => api.get(`/venues/autocomplete?q=${encodeURIComponent(query)}`),
  getVenueById: id => api.get(`/venues/${id}`),
  createVenue: data => api.post('/venues', data),
  updateVenue: (id, data) => api.put(`/venues/${id}`, data),
  getMyVenues: () => api.get('/venues/my-venues'),
  addReview: (id, data) => api.post(`/venues/${id}/reviews`, data),
  toggleFavourite: id => api.post(`/venues/${id}/favourite`),
  getMyFavourites: () => api.get('/venues/my-favourites'),
};

export const locationAPI = {
  getStates: () => api.get('/locations/states'),
  getCities: params => api.get('/locations/cities', { params }),
  getLocalities: city => api.get(`/locations/localities?city=${encodeURIComponent(city)}`),
  createCity: data => api.post('/locations/cities', data),
  createLocality: data => api.post('/locations/localities', data),
};

export const bookingAPI = {
  getSlots: params => api.get('/bookings/slots', { params }),
  holdSlot: data => api.post('/bookings/hold', data),
  checkout: data => api.post('/bookings/checkout', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getOwnerBookings: () => api.get('/bookings/owner-bookings'),
  cancelBooking: (id, data) => api.post(`/bookings/${id}/cancel`, data),
  getReceipt: id => api.get(`/bookings/${id}/receipt`),
};

export const recommendationAPI = {
  getSmartRecommendations: data => api.post('/recommendations/smart', data),
};

export const groupAPI = {
  createSession: data => api.post('/groups', data),
  getSession: id => api.get(`/groups/${id}`),
  joinSession: (id, data) => api.post(`/groups/${id}/join`, data),
  getRecommendations: (id, data) => api.post(`/groups/${id}/recommendations`, data),
};

export const weatherAPI = {
  getVenueWeather: (venueId, date) => api.get(`/weather/venue/${venueId}?date=${date}`),
  getAlternatives: params => api.get('/weather/alternatives', { params }),
};

export const ownerAPI = {
  getAnalytics: () => api.get('/owner/analytics'),
  getSlotOptimisation: () => api.get('/owner/slot-optimisation'),
  getPromotions: () => api.get('/owner/promotions'),
  createPromotion: data => api.post('/owner/promotions', data),
  deletePromotion: id => api.delete(`/owner/promotions/${id}`),
  getBlockedSlots: () => api.get('/owner/blocked-slots'),
  blockSlot: data => api.post('/owner/block-slot', data),
  unblockSlot: id => api.delete(`/owner/blocked-slots/${id}`),
};

export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: params => api.get('/admin/users', { params }),
  getOwners: () => api.get('/admin/owners'),
  reviewOwner: (id, data) => api.patch(`/admin/owners/${id}/approval`, data),
  getPendingVenues: () => api.get('/admin/venue-approvals'),
  reviewVenue: (id, data) => api.patch(`/admin/venues/${id}/approval`, data),
};

export default api;
