// API client utilities for frontend components

export class APIClient {
  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // Route API methods
  async calculateRoute(from, to, preferences) {
    return this.request("/api/routes", {
      method: "POST",
      body: JSON.stringify({ from, to, preferences }),
    });
  }

  // Parking API methods
  async getParkingSpots(location, radius, availability) {
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (radius) params.append("radius", radius.toString());
    if (availability) params.append("availability", availability);

    return this.request(`/api/parking?${params.toString()}`);
  }

  async reserveParking(spotId, duration) {
    return this.request("/api/parking", {
      method: "POST",
      body: JSON.stringify({ spotId, action: "reserve", duration }),
    });
  }

  // Landmarks API methods
  async getLandmarks(location, radius) {
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (radius) params.append("radius", radius.toString());

    return this.request(`/api/landmarks?${params.toString()}`);
  }

  async detectLandmark(landmarkId) {
    return this.request("/api/landmarks", {
      method: "POST",
      body: JSON.stringify({ landmarkId, action: "detect" }),
    });
  }

  // Real-time data methods
  async getRealtimeData(type) {
    const params = type ? `?type=${type}` : "";
    return this.request(`/api/realtime${params}`);
  }

  async reportIncident(incidentData) {
    return this.request("/api/realtime", {
      method: "POST",
      body: JSON.stringify({
        type: "traffic",
        action: "report_incident",
        data: incidentData,
      }),
    });
  }

  // Analytics methods
  async getAnalytics(timeframe, metric) {
    const params = new URLSearchParams();
    if (timeframe) params.append("timeframe", timeframe);
    if (metric) params.append("metric", metric);

    return this.request(`/api/analytics?${params.toString()}`);
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Hook for React components
export function useAPI() {
  return apiClient;
}

// Utility functions for data formatting
export const formatters = {
  currency: (amount) => `₹${amount.toLocaleString()}`,
  duration: (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  },
  distance: (km) => `${km.toFixed(1)} km`,
  percentage: (value) => `${value.toFixed(1)}%`,
  timestamp: (iso) => new Date(iso).toLocaleString(),
};
