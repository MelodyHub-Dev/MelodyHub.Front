const BASE_URL = "https://localhost:7111/api";

/**
 * Регистрация нового пользователя.
 * POST /api/users/create
 */
export async function register({ username, email, password }) {
  const response = await fetch(`${BASE_URL}/users/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, role: 1 }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.errpr || err.message || "Ошибка регистрации");
  }

  return response.json(); // Guid нового пользователя
}

/**
 * Вход — POST /api/auth/login
 * Возвращает { token, userId, username, email, role }
 */
export async function login({ email, password }) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.errpr || err.message || "";
    if (response.status === 404) throw new Error("Пользователь не найден");
    if (response.status === 400 && msg.toLowerCase().includes("not verified"))
      throw new Error("Email не подтверждён");
    if (response.status === 400) throw new Error("Неверный пароль");
    throw new Error(msg || "Ошибка входа");
  }

  return response.json(); // { token, userId, username, email, role }
}

/**
 * Подтверждение email по 6-значному коду.
 * POST /api/auth/verify-email
 */
export async function verifyEmail(token) {
  const response = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.errpr || err.message || "";
    if (response.status === 404) throw new Error("Неверный код подтверждения");
    if (response.status === 400)
      throw new Error(msg.includes("expired") ? "Код истёк" : "Неверный код");
    throw new Error(msg || "Ошибка подтверждения");
  }
}

/**
 * Повторно отправить код подтверждения.
 * POST /api/auth/resend-verification
 */
export async function resendVerification(userId) {
  const response = await fetch(`${BASE_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.errpr || err.message || "Ошибка отправки кода");
  }
}
export function saveSession(data) {
  localStorage.setItem("session", JSON.stringify(data));
}

/** Получить сессию */
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session"));
  } catch {
    return null;
  }
}

/** Получить JWT токен для авторизованных запросов */
export function getToken() {
  return getSession()?.token ?? null;
}

/** Удалить сессию */
export function clearSession() {
  localStorage.removeItem("session");
}
