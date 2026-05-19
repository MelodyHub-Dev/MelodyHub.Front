import { getToken } from "./authService";

const BASE_URL = "https://localhost:7111/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Ошибка ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

export const getUsers = () =>
  fetch(`${BASE_URL}/users`, { headers: authHeaders() }).then(handleResponse);

export const getUserDetails = (id) =>
  fetch(`${BASE_URL}/users/${id}`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const deleteUser = (id) =>
  fetch(`${BASE_URL}/users/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);
