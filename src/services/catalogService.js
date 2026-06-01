import { getToken } from "./authService";

const BASE_URL = "https://localhost:7111/api";

const authHeaders = () => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Ошибка ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// ── Инструменты ──────────────────────────────────────────────────────────────

export const getInstruments = () =>
  fetch(`${BASE_URL}/instruments`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const getInstrumentDetails = (id) =>
  fetch(`${BASE_URL}/instruments/${id}`, { headers: authHeaders() }).then(
    handleResponse,
  );

// ── Категории ────────────────────────────────────────────────────────────────

export const getCategories = () =>
  fetch(`${BASE_URL}/instrument-categories`, { headers: authHeaders() }).then(
    handleResponse,
  );

// ── Материалы инструмента ────────────────────────────────────────────────────

export const getInstrumentMaterials = () =>
  fetch(`${BASE_URL}/instrument-materials`, { headers: authHeaders() }).then(
    handleResponse,
  );

// ── Утилиты ──────────────────────────────────────────────────────────────────

export const getDifficultyText = (difficulty) => {
  const levels = {
    0: "Начинающий",
    1: "Средний",
    2: "Эксперт",
  };
  return levels[difficulty] || "Средний";
};

export const getMaterialUnitText = (unit) => {
  const units = {
    0: "шт.",
    1: "м",
    2: "м²",
    3: "кг",
    4: "л",
    Piece: "шт.",
    Meter: "м",
    SqMeter: "м²",
    Kg: "кг",
    Liter: "л",
    piece: "шт.",
    meter: "м",
    sqm: "м²",
    sqmeter: "м²",
    sqmeter: "м²",
    kg: "кг",
    liter: "л",
    litre: "л",
  };
  return units[unit] ?? units[String(unit)] ?? "шт.";
};

// Вычисление общей стоимости материалов для инструмента
export const calculateInstrumentCost = (instrumentId, materials) => {
  return materials
    .filter((m) => m.instrumentId === instrumentId)
    .reduce((total, material) => total + material.totalCost, 0);
};

// Форматирование цены в белорусские рубли
export const formatPrice = (price) => {
  return new Intl.NumberFormat("be-BY", {
    style: "currency",
    currency: "BYN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};
