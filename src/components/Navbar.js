import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MusicalNoteIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLink = (hash, label) => (
    <a href={hash} onClick={() => setMenuOpen(false)}>
      {label}
    </a>
  );

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__container">
        <button
          className="navbar__logo"
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <MusicalNoteIcon className="navbar__logo-icon" />
          <span className="navbar__logo-text">
            Мастерская<span className="navbar__logo-accent"> Инструментов</span>
          </span>
        </button>

        <ul
          className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}
        >
          <li>{navLink("/catalog", "Каталог")}</li>
          <li>{navLink("/projects", "Проекты")}</li>
          <li>{navLink("/blog", "Блог")}</li>
          <li>{navLink("/quizzes", "Викторины")}</li>
          <li>{navLink("/calculator", "Калькулятор")}</li>
        </ul>

        <div className="navbar__actions">
          {currentUser ? (
            <>
              <button
                className="btn btn--outline"
                onClick={() =>
                  currentUser.role === 2
                    ? navigate("/admin")
                    : navigate("/dashboard")
                }
              >
                👤 {currentUser.username}
              </button>
              <button className="btn btn--outline" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn--outline"
                onClick={() => navigate("/login")}
              >
                Войти
              </button>
              <button
                className="btn btn--primary"
                onClick={() => navigate("/register")}
              >
                Регистрация
              </button>
            </>
          )}
        </div>

        <button
          className="navbar__burger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          {menuOpen ? (
            <XMarkIcon className="navbar__burger-icon" />
          ) : (
            <Bars3Icon className="navbar__burger-icon" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
