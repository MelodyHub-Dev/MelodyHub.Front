import { getToken } from "./authService";

const BASE_URL = "https://localhost:7111/api";

const getHeaders = (auth = false) => {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Ошибка ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
};

/**
 * Получить комментарии к статье.
 * GET /api/article-comments/{articleId}
 */
export async function getArticleComments(articleId) {
  const response = await fetch(`${BASE_URL}/article-comments/${articleId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
}

/**
 * Получить комментарии на модерации.
 * GET /api/article-comments/pending
 */
export async function getPendingArticleComments() {
  const response = await fetch(`${BASE_URL}/article-comments/pending`, {
    method: "GET",
    headers: getHeaders(true),
  });

  return handleResponse(response);
}

/**
 * Создать комментарий к статье.
 * POST /api/article-comments/create
 */
export async function createArticleComment({
  articleId,
  userId,
  content,
  parentCommentId = null,
}) {
  const response = await fetch(`${BASE_URL}/article-comments/create`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({
      articleId,
      userId,
      content,
      parentCommentId,
    }),
  });

  return handleResponse(response);
}

/**
 * Одобрить комментарий.
 * PUT /api/article-comments/approve/{id}
 */
export async function approveArticleComment(commentId) {
  const response = await fetch(
    `${BASE_URL}/article-comments/approve/${commentId}`,
    {
      method: "PUT",
      headers: getHeaders(true),
    },
  );

  return handleResponse(response);
}

/**
 * Обновить комментарий.
 * PUT /api/article-comments/update
 */
export async function updateArticleComment({
  id,
  articleId,
  userId,
  content,
  parentCommentId = null,
}) {
  const response = await fetch(`${BASE_URL}/article-comments/update`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify({
      id,
      articleId,
      userId,
      content,
      parentCommentId,
      isApproved: true,
    }),
  });

  return handleResponse(response);
}

/**
 * Удалить комментарий.
 * DELETE /api/article-comments/delete/{id}
 */
export async function deleteArticleComment(commentId) {
  const response = await fetch(
    `${BASE_URL}/article-comments/delete/${commentId}`,
    {
      method: "DELETE",
      headers: getHeaders(true),
    },
  );

  return handleResponse(response);
}
