const BASE_URL = "https://localhost:7111/api";

/**
 * Получить комментарии к статье.
 * GET /api/article-comments/{articleId}
 */
export async function getArticleComments(articleId) {
  const response = await fetch(`${BASE_URL}/article-comments/${articleId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Ошибка загрузки комментариев");
  }

  return response.json();
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      articleId,
      userId,
      content,
      parentCommentId,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Ошибка создания комментария");
  }

  return response.json();
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      articleId,
      userId,
      content,
      parentCommentId,
      isApproved: true,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error || err.message || "Ошибка обновления комментария",
    );
  }
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
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Ошибка удаления комментария");
  }

  return response.json();
}
