import { getAccessToken } from "./auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function apiFetch(method, path, body) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Could not reach the server. Is the backend running on " +
        API_BASE +
        "?",
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response — leave data null and fall through.
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    if (data?.error?.message) {
      detail = data.error.message;
    } else if (typeof data?.detail === "string") {
      detail = data.detail;
    } else if (Array.isArray(data?.detail)) {
      detail = data.detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
    }
    const err = new Error(detail);
    err.status = res.status;
    err.code = data?.error?.code ?? null;
    err.fieldErrors = data?.error?.details ?? null;
    err.data = data;
    throw err;
  }

  return data;
}

export const apiPost = (path, body) => apiFetch("POST", path, body);
export const apiGet = (path) => apiFetch("GET", path);
