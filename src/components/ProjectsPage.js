import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { getAllUserProjects } from "../services/userProjectService";
import Navbar from "./Navbar";
import "./ProjectsPage.css";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const data = await getAllUserProjects();
      const projectList = data?.userProjects || data || [];
      setProjects(projectList);
      setFilteredProjects(projectList);
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
        project.name?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query),
    );
    setFilteredProjects(filtered);
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  if (loading) {
    return (
      <div className="projects-page">
        <Navbar />
        <div className="projects-page__loading">Загрузка проектов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-page">
        <Navbar />
        <div className="projects-page__error">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <Navbar />
      <div className="projects-page__hero">
        <div className="projects-page__container">
          <h1>Проекты пользователей</h1>
          <p>Идеи и вдохновение от сообщества музыкантов</p>
        </div>
      </div>

      <div className="projects-page__content">
        <div className="projects-page__search">
          <MagnifyingGlassIcon className="projects-page__search-icon" />
          <input
            type="text"
            placeholder="Поиск проектов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="projects-page__search-input"
          />
        </div>

        {filteredProjects.length === 0 ? (
          <div className="projects-page__empty">
            <MusicalNoteIcon className="projects-page__empty-icon" />
            <p>Проекты не найдены</p>
          </div>
        ) : (
          <div className="projects-page__grid">
            {filteredProjects.map((project) => (
              <Link
                to={`/project/${project.id}`}
                className="project-card"
                key={project.id}
              >
                <div className="project-card__cover">
                  <MusicalNoteIcon className="project-card__cover-icon" />
                </div>
                <div className="project-card__body">
                  <h3 className="project-card__title">
                    {project.name || "Без названия"}
                  </h3>
                  <p className="project-card__desc">
                    {project.description?.substring(0, 100)}
                    {project.description?.length > 100 ? "..." : ""}
                  </p>
                  <div className="project-card__meta">
                    <span className="project-card__author">
                      <UserIcon className="project-card__meta-icon" />
                      {project.authorName || "Аноним"}
                    </span>
                    <span className="project-card__date">
                      <CalendarDaysIcon className="project-card__meta-icon" />
                      {formatDate(project.startDate)}
                    </span>
                  </div>
                  <div className="project-card__footer">
                    <span className="project-card__status">
                      {getStatusLabel(project.status)}
                    </span>
                    <span className="project-card__progress">
                      {project.progress || 0}% готово
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
