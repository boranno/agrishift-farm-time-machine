/**
 * AgriShift API Client
 * Centralized HTTP wrapper with graceful connection failure handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  } else if (options.body instanceof FormData) {
    delete config.headers['Content-Type']; // Let browser set multipart boundary
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 8000);
    config.signal = controller.signal;

    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.detail || `API request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    // If backend is not running, return informative offline error without crashing
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out while connecting to AgriShift backend', 408);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error (backend server not started yet)
    throw new ApiError(
      `Cannot connect to AgriShift Backend (${API_BASE_URL}). Using local demonstration data.`,
      0,
      { isOffline: true }
    );
  }
};

export const getApiBaseUrl = () => API_BASE_URL;

export default {
  request,
  getApiBaseUrl,
  ApiError
};

