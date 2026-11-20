const API_BASE = '/api/v1';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('appcheck_token') || null;
    this.refreshToken = localStorage.getItem('appcheck_refresh_token') || null;
  }

  setTokens(access, refresh) {
    this.token = access;
    this.refreshToken = refresh;
    if (access) {
      localStorage.setItem('appcheck_token', access);
    } else {
      localStorage.removeItem('appcheck_token');
    }
    if (refresh) {
      localStorage.setItem('appcheck_refresh_token', refresh);
    } else {
      localStorage.removeItem('appcheck_refresh_token');
    }
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('appcheck_token');
    localStorage.removeItem('appcheck_refresh_token');
    localStorage.removeItem('appcheck_user');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = options.headers || {};

    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401 && this.refreshToken && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        // Try token refresh
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.token}`;
          return fetch(url, { ...options, headers }).then(r => r.json());
        } else {
          this.clearTokens();
          window.location.hash = '#/login';
          throw new Error('Session expired. Please log in again.');
        }
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        return response.blob();
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.message || `Request failed with status ${response.status}`);
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  async refreshAccessToken() {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh?refresh_token=${encodeURIComponent(this.refreshToken)}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        this.setTokens(data.access_token, data.refresh_token);
        return true;
      }
    } catch (e) {
      console.error('Refresh token failed:', e);
    }
    return false;
  }

  // Auth endpoints
  async login(email, password, rememberMe = false) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember_me: rememberMe })
    });
  }

  async register(fullName, email, password, termsAccepted) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password, terms_accepted: termsAccepted })
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {}
    this.clearTokens();
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword })
    });
  }

  // Scans & Analysis
  async uploadAndScan(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/scans', {
      method: 'POST',
      body: formData,
    });
  }

  async getScans(query = '', riskLevel = '', limit = 50, offset = 0) {
    let url = `/scans?limit=${limit}&offset=${offset}`;
    if (query) url += `&query=${encodeURIComponent(query)}`;
    if (riskLevel) url += `&risk_level=${encodeURIComponent(riskLevel)}`;
    return this.request(url);
  }

  async getScanById(scanId) {
    return this.request(`/scans/${scanId}`);
  }

  async deleteScan(scanId) {
    return this.request(`/scans/${scanId}`, { method: 'DELETE' });
  }

  async getScanPermissions(scanId) {
    return this.request(`/scans/${scanId}/permissions`);
  }

  async getScanFindings(scanId) {
    return this.request(`/scans/${scanId}/findings`);
  }

  async getScanRisk(scanId) {
    return this.request(`/scans/${scanId}/risk`);
  }

  async getScanTechnicalDetails(scanId) {
    return this.request(`/scans/${scanId}/technical-details`);
  }

  async downloadReportPdf(scanId) {
    const blob = await this.request(`/scans/${scanId}/report`);
    return blob;
  }

  async getReportsList() {
    return this.request('/reports');
  }

  // Dashboard & System
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getSystemHealth() {
    return this.request('/system/health');
  }

  async getModelStatus() {
    return this.request('/system/model');
  }

  // Settings & Profile
  async updateProfile(fullName) {
    return this.request(`/users/profile?full_name=${encodeURIComponent(fullName)}`, { method: 'PUT' });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
  }

  async deleteAccount(confirmation = 'DELETE') {
    return this.request(`/users/account?confirmation=${encodeURIComponent(confirmation)}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();
