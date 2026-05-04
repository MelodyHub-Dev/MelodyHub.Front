import { getToken } from "./authService";

const BASE_URL = "https://localhost:7111/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.errpr || err.message || `Ошибка ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// ── Профиль ──────────────────────────────────────────────────────────────────

export const getUser = (id) =>
  fetch(`${BASE_URL}/users/${id}`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const updateUser = (dto) =>
  fetch(`${BASE_URL}/users/update`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  }).then(handleResponse);

// ── Проекты ───────────────────────────────────────────────────────────────────

export const getProject = (id) =>
  fetch(`${BASE_URL}/user-projects/${id}`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const getProjects = (userId, instrumentId = null) => {
  const url = instrumentId
    ? `${BASE_URL}/user-projects/user/${userId}?instrumentId=${instrumentId}`
    : `${BASE_URL}/user-projects/user/${userId}`;
  return fetch(url, { headers: authHeaders() }).then(handleResponse);
};

export const createProject = (dto) =>
  fetch(`${BASE_URL}/user-projects/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  }).then(handleResponse);

export const updateProject = (dto) =>
  fetch(`${BASE_URL}/user-projects/update`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  }).then(handleResponse);

export const deleteProject = (id) =>
  fetch(`${BASE_URL}/user-projects/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);

// ── Избранное ─────────────────────────────────────────────────────────────────

export const getFavorites = (userId) =>
  fetch(`${BASE_URL}/user-favorites/${userId}`, {
    headers: authHeaders(),
  }).then(handleResponse);

export const addFavorite = (userId, instrumentId) =>
  fetch(`${BASE_URL}/user-favorites/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ userId, instrumentId }),
  }).then(handleResponse);

export const removeFavorite = (userId, instrumentId) =>
  fetch(`${BASE_URL}/user-favorites/delete`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ userId, instrumentId }),
  }).then(handleResponse);

// ── Аватарка ──────────────────────────────────────────────────────────────────

export const uploadAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/users/${userId}/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` }, // без Content-Type — браузер сам выставит boundary
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.errpr || err.message || "Ошибка загрузки аватарки");
  }

  return response.json(); // { avatarUrl }
};

// ── Инструменты (для выбора в проекте) ───────────────────────────────────────

export const getInstruments = () =>
  fetch(`${BASE_URL}/instruments`, { headers: authHeaders() }).then(
    handleResponse,
  );
