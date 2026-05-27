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

export const getQuizQuestions = (quizId) =>
  fetch(`${BASE_URL}/quiz-questions/${quizId}`, {
    headers: authHeaders(),
  }).then(handleResponse);

export const createQuizQuestion = (data) =>
  fetch(`${BASE_URL}/quiz-questions/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateQuizQuestion = (data) =>
  fetch(`${BASE_URL}/quiz-questions/update`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteQuizQuestion = (id) =>
  fetch(`${BASE_URL}/quiz-questions/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);
