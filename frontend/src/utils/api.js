import { API_BASE_URL } from "./constants";

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    credentials: "include",
  });

  if (response.status === 401 && endpoint !== "/auth/refresh-token") {
    const refreshed = await request("/auth/refresh-token", { method: "POST" });
    if (refreshed?.data?.accessToken) {
      setAccessToken(refreshed.data.accessToken);
      return request(endpoint, options);
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
  post: (endpoint, body) => request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};
