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

export const getProjectNotes = (projectId) =>
  fetch(`${BASE_URL}/project-notes/${projectId}`, {
    headers: authHeaders(),
  }).then(handleResponse);

export const createProjectNote = (dto) =>
  fetch(`${BASE_URL}/project-notes/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  }).then(handleResponse);

export const deleteProjectNote = (id) =>
  fetch(`${BASE_URL}/project-notes/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);
