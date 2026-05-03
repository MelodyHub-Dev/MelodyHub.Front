import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  MusicalNoteIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "./LoginForm.css";

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Введите email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Некорректный email";
    if (!form.password) e.password = "Введите пароль";
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
      const data = await login(form);
      authLogin(data);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.message.includes("not verified")) {
        navigate("/verify-email", {
          state: { email: form.email, password: form.password },
        });
        return;
      }
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

        <h1 className="auth-card__title">Добро пожаловать</h1>
        <p className="auth-card__subtitle">Войдите в свой аккаунт</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="login-email">
              Email
            </label>
            <div className="auth-form__input-wrap">
              <EnvelopeIcon className="auth-form__input-icon" />
              <input
                id="login-email"
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
            <label className="auth-form__label" htmlFor="login-password">
              Пароль
            </label>
            <div className="auth-form__input-wrap">
              <LockClosedIcon className="auth-form__input-icon" />
              <input
                id="login-password"
                className={`auth-form__input${errors.password ? " auth-form__input--error" : ""}`}
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
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

          <button
            type="submit"
            className="auth-form__submit"
            disabled={loading}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        {serverError && (
          <p className="auth-form__server-error">{serverError}</p>
        )}

        <p className="auth-card__footer">
          Нет аккаунта?{" "}
          <Link to="/register" className="auth-card__footer_link">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
