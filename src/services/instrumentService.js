import { getToken } from "./authService";

const BASE_URL = "https://localhost:7111/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const errorTranslations = {
  "One or more validation errors occurred.":
    "Произошла одна или несколько ошибок валидации.",
  "The dto field is required.": "Поле dto обязательно.",
  "Instrument name is required": "Название инструмента обязательно",
  "Instrument name must not exceed 200 characters":
    "Название инструмента не должно превышать 200 символов",
  "Instrument name must be at least 2 characters long":
    "Название инструмента должно содержать минимум 2 символа",
  "Name can only contain letters, numbers, spaces, hyphens, underscores, ampersands, dots, commas, apostrophes, parentheses, and forward slashes":
    "Название может содержать только буквы, цифры, пробелы и символы - _ & . , ' () /",
  "Description is required": "Описание обязательно",
  "Description must be at least 20 characters long":
    "Описание должно содержать минимум 20 символов",
  "Description must not exceed 2000 characters":
    "Описание не должно превышать 2000 символов",
  "Short description must not exceed 500 characters":
    "Краткое описание не должно превышать 500 символов",
  "Short description must be at least 10 characters long":
    "Краткое описание должно содержать минимум 10 символов",
  "Invalid difficulty level": "Неверный уровень сложности",
  "Estimated hours must be greater than 0":
    "Примерное время должно быть больше 0",
  "Estimated hours must not exceed 1000":
    "Примерное время не должно превышать 1000",
  "Image URL must not exceed 500 characters":
    "URL изображения не должен превышать 500 символов",
  "Invalid image URL format": "Неверный формат URL изображения",
  "Views count cannot be negative":
    "Количество просмотров не может быть отрицательным",
  "Category is required": "Категория обязательна",
  "Category ID cannot be empty": "ID категории не может быть пустым",
};

const translateError = (message) => {
  if (!message) return message;
  if (message.startsWith("The JSON value could not be converted to")) {
    return message.replace(
      "The JSON value could not be converted to",
      "Невозможно преобразовать JSON-значение к",
    );
  }
  return errorTranslations[message] || message;
};

const normalizeErrorValue = (value, keyPrefix = "") => {
  if (value == null) return [];
  if (typeof value === "string") {
    const prefix = keyPrefix ? `${keyPrefix}: ` : "";
    return [`${prefix}${translateError(value)}`];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeErrorValue(item, keyPrefix));
  }
  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, nestedValue]) => {
      const nextPrefix = keyPrefix ? `${keyPrefix}.${key}` : key;
      return normalizeErrorValue(nestedValue, nextPrefix);
    });
  }
  return [];
};

const parseApiError = (err) => {
  if (!err) return null;
  if (typeof err === "string") return translateError(err);
  if (err.error) return translateError(err.error);
  if (err.message) return translateError(err.message);
  if (err.errpr) return translateError(err.errpr);

  if (err.title && err.title !== err.error && err.title !== err.message) {
    const title = translateError(err.title);
    if (err.errors) {
      const details = normalizeErrorValue(err.errors);
      return details.length > 0 ? `${title}: ${details.join("; ")}` : title;
    }
    return title;
  }

  if (err.errors) {
    const details = normalizeErrorValue(err.errors);
    if (details.length > 0) return details.join("; ");
  }

  const nested = normalizeErrorValue(err);
  if (nested.length > 0) return nested.join("; ");
  return JSON.stringify(err);
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const message = parseApiError(err) || `Ошибка ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
};

export const getInstruments = () =>
  fetch(`${BASE_URL}/instruments`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const getInstrumentById = (id) =>
  fetch(`${BASE_URL}/instruments/${id}`, {
    headers: authHeaders(),
  }).then(handleResponse);

export const createInstrument = (data) =>
  fetch(`${BASE_URL}/instruments/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateInstrument = (data) =>
  fetch(`${BASE_URL}/instruments/update`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteInstrument = (id) =>
  fetch(`${BASE_URL}/instruments/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);

export const incrementInstrumentViews = (id) =>
  fetch(`${BASE_URL}/instruments/${id}/views`, {
    method: "POST",
  }).then(handleResponse);

export const getInstrumentCategories = () =>
  fetch(`${BASE_URL}/instrument-categories`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const getMaterials = () =>
  fetch(`${BASE_URL}/materials`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const uploadInstrumentImage = async (instrumentId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${BASE_URL}/instruments/${instrumentId}/image`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    const message = parseApiError(err) || "Ошибка загрузки изображения";
    throw new Error(message);
  }

  return response.json();
};
