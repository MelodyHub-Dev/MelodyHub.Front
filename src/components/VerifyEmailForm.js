import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MusicalNoteIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import {
  verifyEmail,
  resendVerification,
  login,
} from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "./LoginForm.css";
import "./VerifyEmailForm.css";

const VerifyEmailForm = () => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // state передаётся из RegisterForm или LoginForm
  const { userId, email, password } = location.state || {};

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setServerError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = digits.join("");
    if (token.length < 6) {
      setServerError("Введите все 6 цифр кода");
      return;
    }
    setLoading(true);
    setServerError("");
    try {
      await verifyEmail(token);
      if (email && password) {
        const data = await login({ email, password });
        authLogin(data);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userId || resendCooldown > 0) return;
    try {
      await resendVerification(userId);
      setResendCooldown(60);
      setServerError("");
    } catch (err) {
      setServerError(err.message);
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

        <div className="verify__icon-wrap">
          <EnvelopeIcon className="verify__icon" />
        </div>

        <h1 className="auth-card__title">Подтверди email</h1>
        <p className="auth-card__subtitle">
          Мы отправили 6-значный код на{" "}
          <span className="verify__email">{email || "твой email"}</span>
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="verify__digits" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                className={`verify__digit${serverError ? " verify__digit--error" : ""}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                aria-label={`Цифра ${i + 1}`}
              />
            ))}
          </div>

          {serverError && (
            <p className="auth-form__server-error">{serverError}</p>
          )}

          <button
            type="submit"
            className="auth-form__submit"
            disabled={loading}
          >
            {loading ? "Проверяем..." : "Подтвердить"}
          </button>
        </form>

        <p className="auth-card__footer">
          Не получил код?{" "}
          {resendCooldown > 0 ? (
            <span className="verify__cooldown">
              Отправить снова через {resendCooldown}с
            </span>
          ) : (
            <button
              type="button"
              className="auth-link-btn"
              onClick={handleResend}
            >
              Отправить снова
            </button>
          )}
        </p>

        <p className="auth-card__footer" style={{ marginTop: 8 }}>
          <Link to="/login">← Вернуться ко входу</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailForm;
