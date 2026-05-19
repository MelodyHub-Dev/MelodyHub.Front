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
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Ошибка загрузки изображения");
  }

  return response.json();
};
