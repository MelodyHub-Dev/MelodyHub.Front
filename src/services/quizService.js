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

export const getAllQuizzes = () =>
  fetch(`${BASE_URL}/quizzes`, { headers: authHeaders() }).then(handleResponse);

export const getQuizDetails = (id) =>
  fetch(`${BASE_URL}/quizzes/${id}`, { headers: authHeaders() }).then(
    handleResponse,
  );

export const createQuiz = (data) =>
  fetch(`${BASE_URL}/quizzes/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateQuiz = (data) =>
  fetch(`${BASE_URL}/quizzes/update`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteQuiz = (id) =>
  fetch(`${BASE_URL}/quizzes/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);

export const saveQuizResult = (data) =>
  fetch(`${BASE_URL}/quiz-results/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const getUserQuizResults = (userId) =>
  fetch(`${BASE_URL}/quiz-results/${userId}`, { headers: authHeaders() }).then(
    handleResponse,
  );
