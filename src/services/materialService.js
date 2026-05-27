import { getToken } from "./authService";

const BASE_URL = "https://localhost:7111/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const message = err?.error || err?.message || `Ошибка ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
};

export const getMaterials = () =>
  fetch(`${BASE_URL}/materials`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const createMaterial = (data) =>
  fetch(`${BASE_URL}/materials/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteMaterial = (id) =>
  fetch(`${BASE_URL}/materials/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);
