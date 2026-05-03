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

export const getBlueprints = (instrumentId) =>
  fetch(`${BASE_URL}/blueprints?instrumentId=${instrumentId}`, {
    headers: authHeaders(),
  }).then(handleResponse);

export const getBlueprintDetails = (id) =>
  fetch(`${BASE_URL}/blueprints/${id}`, { headers: authHeaders() }).then(
    handleResponse,
  );

// ── Утилиты ──────────────────────────────────────────────────────────────────

export const formatTime = (minutes) => {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} мин`;
  return `${hours} ч ${mins} мин`;
};
