import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserGroupIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  LightBulbIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { getStatistics } from "../services/adminService";
import "./AdminPanel.css";

const AdminPanel = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    articles: 0,
    projects: 0,
    instruments: 0,
    instructions: 0,
    pendingComments: 0,
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
          pendingComments: data.pendingComments || 0,
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
        <div className="stat-card">
          <h3>На модерации</h3>
          <p className="stat-number">{stats.pendingComments}</p>
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
          <Link to="/admin/materials" className="action-card">
            <Squares2X2Icon className="action-card__icon" />
            <h3>Материалы</h3>
            <p>Добавлять и удалять материалы</p>
          </Link>
          <Link to="/admin/instrument-categories" className="action-card">
            <Squares2X2Icon className="action-card__icon" />
            <h3>Категории инструментов</h3>
            <p>Добавлять и удалять категории инструментов</p>
          </Link>
          <Link to="/admin/instructions" className="action-card">
            <BookOpenIcon className="action-card__icon" />
            <h3>Инструкции</h3>
            <p>Управление инструкциями</p>
          </Link>
          <Link to="/admin/comments" className="action-card">
            <ChatBubbleLeftIcon className="action-card__icon" />
            <h3>Модерация комментариев</h3>
            <p>Одобрять или удалять новые комментарии</p>
          </Link>
          <Link to="/admin/quizzes" className="action-card">
            <LightBulbIcon className="action-card__icon" />
            <h3>Викторины</h3>
            <p>Управление викторинами</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
