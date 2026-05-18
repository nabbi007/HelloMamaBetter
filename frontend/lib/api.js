const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function apiPost(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    if (data) {
      if (typeof data.detail === "string") {
        detail = data.detail;
      } else if (Array.isArray(data.detail)) {
        detail = data.detail
          .map((d) => d.msg || JSON.stringify(d))
          .join("; ");
      }
    }
    const err = new Error(detail);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
