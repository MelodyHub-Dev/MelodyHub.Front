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

// ── Инструкции (Blueprints) ──────────────────────────────────────────────────

export const getBlueprints = (instrumentId) => {
  const query = instrumentId ? `?instrumentId=${instrumentId}` : "";
  return fetch(`${BASE_URL}/blueprints${query}`, {
    headers: authHeaders(),
  }).then(handleResponse);
};

export const getBlueprintDetails = (id) =>
  fetch(`${BASE_URL}/blueprints/${id}`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const createBlueprint = (data) =>
  fetch(`${BASE_URL}/blueprints/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateBlueprint = (data) =>
  fetch(`${BASE_URL}/blueprints/update`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteBlueprint = (id) =>
  fetch(`${BASE_URL}/blueprints/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);

// ── Утилиты ──────────────────────────────────────────────────────────────────

export const formatTime = (minutes) => {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} мин`;
  return `${hours} ч ${mins} мин`;
};

export const uploadBlueprintImage = async (blueprintId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/blueprints/${blueprintId}/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    const message =
      (err && (err.error || err.message)) || "Ошибка загрузки изображения";
    throw new Error(message);
  }

  return response.json();
};

export const uploadBlueprintVideo = async (blueprintId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/blueprints/${blueprintId}/video`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    const message =
      (err && (err.error || err.message)) || "Ошибка загрузки видео";
    throw new Error(message);
  }

  return response.json();
};
