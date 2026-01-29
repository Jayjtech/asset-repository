import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

const tokenKey = "asset_repo_token";
const tokenDays = 7;

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          errors?: Record<string, string[]>;
        }
      | undefined;
    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      const firstMessage = data.errors[firstKey]?.[0];
      if (firstMessage) return firstMessage;
    }
    if (data?.message) return data.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const cookies = document.cookie.split(";").map((item) => item.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${tokenKey}=`));
  if (!match) return null;
  const value = match.split("=").slice(1).join("=");
  return value ? decodeURIComponent(value) : null;
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  const expires = new Date();
  expires.setDate(expires.getDate() + tokenDays);
  document.cookie = `${tokenKey}=${encodeURIComponent(
    token,
  )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function clearToken() {
  if (typeof window === "undefined") return;
  document.cookie = `${tokenKey}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_domain?: string;
  company_name?: string;
}) {
  const { data } = await api.post("/api/v1/auth/register", payload);
  return data as { data: unknown; token: string };
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post("/api/v1/auth/login", payload);
  return data as { data: unknown; token: string };
}

export async function logout() {
  const token = getToken();
  if (!token) return;
  await api.post(
    "/api/v1/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  clearToken();
}

export async function getMe() {
  const token = getToken();
  if (!token) return null;
  const { data } = await api.get("/api/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data as {
    data: {
      id: number;
      name: string;
      email: string;
      created_at?: string;
    };
  };
}

export async function listProjects() {
  const token = getToken();
  const { data } = await api.get("/api/v1/projects", {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return data as {
    data: Array<{
      id: number;
      name: string;
      website_url?: string;
      created_at?: string;
      updated_at?: string;
      assets_count?: number;
      created_by_user_id?: number;
      creator_name?: string;
    }>;
  };
}

export async function listUsers(email?: string) {
  const token = getToken();
  const { data } = await api.get("/api/v1/users", {
    params: email ? { email } : undefined,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return data as { data: Array<{ id: number; name: string; email: string }> };
}

export async function getUserStats() {
  const token = getToken();
  const { data } = await api.get("/api/v1/users/stats", {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return data as {
    projects_count: number;
    assets_count: number;
    member_projects_count: number;
  };
}

export async function listUserAssets() {
  const token = getToken();
  const { data } = await api.get("/api/v1/users/assets", {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return data as {
    data: Array<Record<string, unknown>>;
  };
}

export async function createProject(payload: {
  name: string;
  website_url: string;
}) {
  const token = getToken();
  const { data } = await api.post("/api/v1/projects", payload, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return data;
}

export async function updateProject(
  projectId: string | number,
  payload: {
    name?: string;
    website_url?: string;
    extra_data?: Record<string, string>;
    add_user_email?: string;
  },
) {
  const token = getToken();
  const { data } = await api.patch(`/api/v1/projects/${projectId}`, payload, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return data;
}

export async function getProject(projectId: string | number) {
  const token = getToken();
  const { data } = await api.get(`/api/v1/projects/${projectId}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return data as {
    data: {
      id: number;
      name: string;
      website_url?: string;
      assets?: unknown[];
    };
  };
}

export async function listProjectAssets(projectId: string | number) {
  const token = getToken();
  const { data } = await api.get(`/api/v1/projects/${projectId}/assets`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return data as { data: Array<Record<string, unknown>> };
}

export async function uploadProjectAsset(
  projectId: string | number,
  file: File,
) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(
    `/api/v1/projects/${projectId}/assets`,
    formData,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
  );
  return data;
}

export async function deleteAsset(assetId: string | number) {
  const token = getToken();
  const { data } = await api.delete(`/api/v1/assets/${assetId}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return data;
}

export async function deleteProject(projectId: string | number) {
  const token = getToken();
  const { data } = await api.delete(`/api/v1/projects/${projectId}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return data;
}
