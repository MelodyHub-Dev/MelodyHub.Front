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

export const getAllBlogArticles = (isPublished) => {
  const url = new URL(`${BASE_URL}/blog-articles/all`);

  if (typeof isPublished !== "undefined") {
    url.searchParams.append("isPublished", String(isPublished));
  }

  return fetch(url.toString(), { headers: authHeaders() }).then(handleResponse);
};

export const getArticles = getAllBlogArticles;

export const getBlogArticlesByAuthor = (authorId) =>
  fetch(`${BASE_URL}/blog-articles/${authorId}`, {
    headers: authHeaders(),
  }).then(handleResponse);

export const getBlogArticleDetails = (id) =>
  fetch(`${BASE_URL}/blog-articles/details/${id}`, {
    headers: authHeaders(),
  }).then(handleResponse);

export const createBlogArticle = (data) =>
  fetch(`${BASE_URL}/blog-articles/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const uploadArticleImage = async (articleId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/blog-articles/${articleId}/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Ошибка загрузки изображения");
  }

  return response.json();
};

export const deleteBlogArticle = (id) =>
  fetch(`${BASE_URL}/blog-articles/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);

export const deleteArticle = deleteBlogArticle;

export const updateBlogArticle = (data) => {
  // Ensure id is sent as a string (Guid)
  const payload = {
    ...data,
    id: String(data.id),
  };
  return fetch(`${BASE_URL}/blog-articles/update`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
};

export const incrementArticleViews = (articleId) =>
  fetch(`${BASE_URL}/blog-articles/${articleId}/views`, {
    method: "POST",
    headers: authHeaders(),
  }).then(handleResponse);

export const formatPrice = (price) => {
  return new Intl.NumberFormat("be-BY", {
    style: "currency",
    currency: "BYN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};
