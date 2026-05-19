import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  MusicalNoteIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { getUserProjects, deleteProject } from "../services/userProjectService";
import "./AdminProjects.css";

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmProjectId, setConfirmProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchQuery, projects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getUserProjects();
      setProjects(data?.userProjects || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = projects.filter(
      (project) =>
        project.title?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query),
    );
    setFilteredProjects(filtered);
  };

  const handleDeleteClick = (id) => {
    setConfirmProjectId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmProjectId) return;

    try {
      setDeletingId(confirmProjectId);
      await deleteProject(confirmProjectId);
      setProjects(projects.filter((p) => p.id !== confirmProjectId));
    } catch (err) {
      alert("Ошибка удаления: " + err.message);
    } finally {
      setDeletingId(null);
      setShowConfirm(false);
      setConfirmProjectId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setConfirmProjectId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      0: "Запланирован",
      1: "В процессе",
      2: "Приостановлен",
      3: "Завершён",
      4: "Отменён",
    };
    return statusMap[status] || "Неизвестно";
  };

  const getStatusClass = (status) => {
    const classMap = {
      0: "badge--draft",
      1: "badge--published",
      2: "badge--draft",
      3: "badge--published",
      4: "badge--draft",
    };
    return classMap[status] || "badge--draft";
  };

  if (loading) {
    return (
      <div className="admin-projects">
        <div className="admin-projects__loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-projects">
        <div className="admin-projects__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-projects">
      <div className="admin-projects__header">
        <Link to="/admin" className="admin-projects__back">
          <ArrowLeftIcon className="admin-projects__back-icon" />
          Назад
        </Link>
        <h1>Управление проектами</h1>
        <span className="admin-projects__count">
          {filteredProjects.length} из {projects.length}
        </span>
      </div>

      <div className="admin-projects__search">
        <MagnifyingGlassIcon className="admin-projects__search-icon" />
        <input
          type="text"
          placeholder="Поиск по названию или описанию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-projects__search-input"
        />
      </div>

      <div className="admin-projects__table-container">
        <table className="admin-projects__table">
          <thead>
            <tr>
              <th>Проект</th>
              <th>Статус</th>
              <th>Прогресс</th>
              <th>Начало</th>
              <th>Окончание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects?.map((project) => (
              <tr key={project.id}>
                <td>
                  <div className="admin-projects__project">
                    <div className="admin-projects__icon">
                      <MusicalNoteIcon className="admin-projects__icon-svg" />
                    </div>
                    <div className="admin-projects__info">
                      <span className="admin-projects__title">
                        {project.name || "Без названия"}
                      </span>
                      <span className="admin-projects__description">
                        {project.description?.substring(0, 60)}...
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getStatusClass(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </td>
                <td>{project.progress || 0}%</td>
                <td>{formatDate(project.startDate)}</td>
                <td>{formatDate(project.finishDate)}</td>
                <td>
                  <div className="admin-projects__actions">
                    <Link
                      to={`/project/${project.id}`}
                      className="btn btn--outline btn--sm"
                      title="Просмотр"
                    >
                      <EyeIcon className="btn__icon" />
                    </Link>
                    <button
                      className="btn btn--outline btn--sm"
                      title="Редактировать"
                    >
                      <PencilIcon className="btn__icon" />
                    </button>
                    <button
                      className="btn btn--outline btn--sm btn--danger"
                      onClick={() => handleDeleteClick(project.id)}
                      disabled={deletingId === project.id}
                      title="Удалить"
                    >
                      <TrashIcon className="btn__icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProjects.length === 0 && (
        <div className="admin-projects__empty">
          <MusicalNoteIcon className="admin-projects__empty-icon" />
          <p>Проекты не найдены</p>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить этот проект?</p>
            <div className="modal__actions">
              <button className="btn btn--outline" onClick={handleCancelDelete}>
                Отмена
              </button>
              <button
                className="btn btn--primary btn--danger"
                onClick={handleConfirmDelete}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
