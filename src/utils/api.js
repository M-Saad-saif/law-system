export const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || data.error || "Something went wrong");
  return data;
};

export const api = {
  get: (url) => apiFetch(url),
  post: (url, body) =>
    apiFetch(url, { method: "POST", body: JSON.stringify(body) }),
  put: (url, body) =>
    apiFetch(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: (url, body) =>
    apiFetch(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (url, body) =>
    apiFetch(url, {
      method: "DELETE",
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
};

export const uploadFile = async (url, formData) => {
  const res = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data;
};
