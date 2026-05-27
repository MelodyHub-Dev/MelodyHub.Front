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

export const getInstrumentCategories = () =>
  fetch(`${BASE_URL}/instrument-categories`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const createInstrumentCategory = (data) =>
  fetch(`${BASE_URL}/instrument-categories/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteInstrumentCategory = (id) =>
  fetch(`${BASE_URL}/instrument-categories/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);
