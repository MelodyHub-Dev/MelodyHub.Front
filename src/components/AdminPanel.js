import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserGroupIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { getStatistics } from "../services/adminService";
import "./AdminPanel.css";

const AdminPanel = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    articles: 0,
    projects: 0,
    instruments: 0,
    instructions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStatistics();
        setStats({
          users: data.users,
          articles: data.articles,
          projects: data.projects,
          instruments: data.instruments,
          instructions: data.instructions,
        });
      } catch (error) {
        console.error("Ошибка загрузки статистики:", error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header__info">
          <h1>Панель администратора</h1>
        </div>
        <button className="admin-header__logout" onClick={handleLogout}>
          <ArrowRightOnRectangleIcon className="admin-header__logout-icon" />
          Выйти
        </button>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Пользователи</h3>
          <p className="stat-number">{stats.users}</p>
        </div>
        <div className="stat-card">
          <h3>Статьи</h3>
          <p className="stat-number">{stats.articles}</p>
        </div>
        <div className="stat-card">
          <h3>Проекты</h3>
          <p className="stat-number">{stats.projects}</p>
        </div>
        <div className="stat-card">
          <h3>Инструменты</h3>
          <p className="stat-number">{stats.instruments}</p>
        </div>
        <div className="stat-card">
          <h3>Инструкции</h3>
          <p className="stat-number">{stats.instructions}</p>
        </div>
      </div>

      <div className="admin-actions">
        <h2>Управление</h2>
        <div className="action-grid">
          <Link to="/admin/users" className="action-card">
            <UserGroupIcon className="action-card__icon" />
            <h3>Пользователи</h3>
            <p>Управление пользователями</p>
          </Link>
          <Link to="/admin/articles" className="action-card">
            <DocumentTextIcon className="action-card__icon" />
            <h3>Статьи</h3>
            <p>Управление статьями блога</p>
          </Link>
          <Link to="/admin/projects" className="action-card">
            <MusicalNoteIcon className="action-card__icon" />
            <h3>Проекты</h3>
            <p>Управление проектами</p>
          </Link>
          <Link to="/admin/instruments" className="action-card">
            <WrenchScrewdriverIcon className="action-card__icon" />
            <h3>Инструменты</h3>
            <p>Управление инструментами</p>
          </Link>
          <Link to="/admin/instructions" className="action-card">
            <BookOpenIcon className="action-card__icon" />
            <h3>Инструкции</h3>
            <p>Управление инструкциями</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
