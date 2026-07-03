const BASE_URL = 'http://localhost:8080';

// Helper to get headers with Bearer Token if it exists
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic request helper
const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = getHeaders();
  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      // Return the error message from backend if available
      const errorMsg = data.error || data.message || 'Request failed';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
};

export const api = {
  // Authentication
  register: async (username, email, password) => {
    const data = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    // The response returned has accessToken
    if (data && data.accessToken) {
      localStorage.setItem('token', data.accessToken);
    }
    return data;
  },

  login: async (email, password) => {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data && data.accessToken) {
      localStorage.setItem('token', data.accessToken);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // User Profile
  getProfile: async () => {
    return await request('/api/users/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (username, email, preferredUnit, goalVisibility) => {
    return await request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({
        username,
        email,
        sustainabilityPreferences: {
          preferredUnit,
          goalVisibility,
        },
      }),
    });
  },

  // Activity Logs
  getLogs: async () => {
    return await request('/api/activity-logs', {
      method: 'GET',
    });
  },

  createLog: async (category, activityType, quantity, unit, logDate) => {
    return await request('/api/activity-logs', {
      method: 'POST',
      body: JSON.stringify({
        category,
        activityType,
        quantity: parseFloat(quantity),
        unit,
        logDate,
      }),
    });
  },
};
