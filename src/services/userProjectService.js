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

export const getAllUserProjects = () =>
  fetch(`${BASE_URL}/user-projects/all`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const getUserProjects = getAllUserProjects;

export const getUserProjectById = (id) =>
  fetch(`${BASE_URL}/user-projects/${id}`, {
    headers: authHeaders(),
  }).then(handleResponse);

export const getPublicUserProjectById = (id) =>
  fetch(`${BASE_URL}/user-projects/public/${id}`).then(handleResponse);

export const createUserProject = (data) =>
  fetch(`${BASE_URL}/user-projects/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateUserProject = (data) =>
  fetch(`${BASE_URL}/user-projects/update`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteUserProject = (id) =>
  fetch(`${BASE_URL}/user-projects/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);

export const deleteProject = deleteUserProject;
