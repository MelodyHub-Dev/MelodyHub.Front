import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MusicalNoteIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { register } from "../services/authService";
import { uploadAvatar } from "../services/profileService";
import AvatarUploader from "./AvatarUploader";
import "./LoginForm.css";

const RegisterForm = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const avatarFileRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Введите имя пользователя";
    else if (form.username.trim().length < 3) e.username = "Минимум 3 символа";
    if (!form.email.trim()) e.email = "Введите email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Некорректный email";
    if (!form.password) e.password = "Введите пароль";
    else if (form.password.length < 8) e.password = "Минимум 8 символов";
    else if (!/[A-Z]/.test(form.password))
      e.password = "Нужна хотя бы одна заглавная буква";
    else if (!/[a-z]/.test(form.password))
      e.password = "Нужна хотя бы одна строчная буква";
    else if (!/[0-9]/.test(form.password))
      e.password = "Нужна хотя бы одна цифра";
    else if (!/[^a-zA-Z0-9]/.test(form.password))
      e.password = "Нужен хотя бы один спецсимвол";
    if (!form.confirmPassword) e.confirmPassword = "Подтвердите пароль";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Пароли не совпадают";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setServerError("");
    try {
      const userId = await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      // Загружаем аватарку если выбрана (ошибка не блокирует регистрацию)
      if (avatarFileRef.current) {
        await uploadAvatar(userId, avatarFileRef.current).catch(() => {});
      }
      navigate("/verify-email", {
        state: { userId, email: form.email, password: form.password },
      });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg-circle auth-page__bg-circle--1" />
      <div className="auth-page__bg-circle auth-page__bg-circle--2" />

      <div className="auth-card">
        <div className="auth-card__logo">
          <MusicalNoteIcon className="auth-card__logo-icon" />
          <span className="auth-card__logo-text">
            Мастерская
            <span className="auth-card__logo-accent"> Инструментов</span>
          </span>
        </div>

        <h1 className="auth-card__title">Создать аккаунт</h1>
        <p className="auth-card__subtitle">
          Присоединяйтесь к сообществу мастеров
        </p>

        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}
        >
          <AvatarUploader
            initials={
              form.username ? form.username.slice(0, 2).toUpperCase() : "?"
            }
            onChange={(file) => {
              avatarFileRef.current = file;
            }}
            size="lg"
          />
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--gray)",
            marginBottom: 12,
          }}
        >
          Нажми чтобы загрузить фото (необязательно)
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="reg-username">
              Имя пользователя
            </label>
            <div className="auth-form__input-wrap">
              <UserIcon className="auth-form__input-icon" />
              <input
                id="reg-username"
                className={`auth-form__input${errors.username ? " auth-form__input--error" : ""}`}
                type="text"
                name="username"
                placeholder="mastercraft"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
            {errors.username && (
              <span className="auth-form__error">{errors.username}</span>
            )}
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="reg-email">
              Email
            </label>
            <div className="auth-form__input-wrap">
              <EnvelopeIcon className="auth-form__input-icon" />
              <input
                id="reg-email"
                className={`auth-form__input${errors.email ? " auth-form__input--error" : ""}`}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="auth-form__error">{errors.email}</span>
            )}
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="reg-password">
              Пароль
            </label>
            <div className="auth-form__input-wrap">
              <LockClosedIcon className="auth-form__input-icon" />
              <input
                id="reg-password"
                className={`auth-form__input${errors.password ? " auth-form__input--error" : ""}`}
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-form__toggle-pass"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPass ? (
                  <EyeSlashIcon className="auth-form__toggle-pass-icon" />
                ) : (
                  <EyeIcon className="auth-form__toggle-pass-icon" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="auth-form__error">{errors.password}</span>
            )}
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="reg-confirm">
              Подтверждение пароля
            </label>
            <div className="auth-form__input-wrap">
              <LockClosedIcon className="auth-form__input-icon" />
              <input
                id="reg-confirm"
                className={`auth-form__input${errors.confirmPassword ? " auth-form__input--error" : ""}`}
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-form__toggle-pass"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Скрыть пароль" : "Показать пароль"}
              >
                {showConfirm ? (
                  <EyeSlashIcon className="auth-form__toggle-pass-icon" />
                ) : (
                  <EyeIcon className="auth-form__toggle-pass-icon" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="auth-form__error">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-form__submit"
            disabled={loading}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        {serverError && (
          <p className="auth-form__server-error">{serverError}</p>
        )}

        <p className="auth-card__footer">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="auth-card__footer_link">
            Войти
          </Link>
        </p>
        <p className="auth-card__footer">
          Вернуться на главную?{" "}
          <Link to="/" className="auth-card__footer_link">
            На главную
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
