import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { getArticles, deleteArticle } from "../services/blogService";
import "./AdminArticles.css";

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmArticleId, setConfirmArticleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchQuery, articles]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await getArticles();
      setArticles(data?.blogArticles || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    if (!searchQuery.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = articles.filter(
      (article) =>
        article.title?.toLowerCase().includes(query) ||
        article.excerpt?.toLowerCase().includes(query),
    );
    setFilteredArticles(filtered);
  };

  const handleDeleteClick = (id) => {
    setConfirmArticleId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmArticleId) return;

    try {
      setDeletingId(confirmArticleId);
      await deleteArticle(confirmArticleId);
      setArticles(articles.filter((a) => a.id !== confirmArticleId));
    } catch (err) {
      alert("Ошибка удаления: " + err.message);
    } finally {
      setDeletingId(null);
      setShowConfirm(false);
      setConfirmArticleId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setConfirmArticleId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  if (loading) {
    return (
      <div className="admin-articles">
        <div className="admin-articles__loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-articles">
        <div className="admin-articles__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-articles">
      <div className="admin-articles__header">
        <Link to="/admin" className="admin-articles__back">
          <ArrowLeftIcon className="admin-articles__back-icon" />
          Назад
        </Link>
        <h1>Управление статьями</h1>
        <span className="admin-articles__count">
          {filteredArticles.length} из {articles.length}
        </span>
      </div>

      <div className="admin-articles__search">
        <MagnifyingGlassIcon className="admin-articles__search-icon" />
        <input
          type="text"
          placeholder="Поиск по заголовку или описанию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-articles__search-input"
        />
      </div>

      <div className="admin-articles__table-container">
        <table className="admin-articles__table">
          <thead>
            <tr>
              <th>Статья</th>
              <th>Просмотры</th>
              <th>Комментарии</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles?.map((article) => (
              <tr key={article.id}>
                <td>
                  <div className="admin-articles__article">
                    <div className="admin-articles__icon">
                      <DocumentTextIcon className="admin-articles__icon-svg" />
                    </div>
                    <div className="admin-articles__info">
                      <span className="admin-articles__title">
                        {article.title || "Без заголовка"}
                      </span>
                      <span className="admin-articles__excerpt">
                        {article.excerpt?.substring(0, 60)}...
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="admin-articles__stat">
                    <EyeIcon className="admin-articles__stat-icon" />
                    {article.viewsCount || 0}
                  </div>
                </td>
                <td>
                  <div className="admin-articles__stat">
                    <ChatBubbleLeftIcon className="admin-articles__stat-icon" />
                    {article.commentCount || 0}
                  </div>
                </td>
                <td>{formatDate(article.publishedAt || article.createdAt)}</td>
                <td>
                  <span
                    className={`badge ${article.isPublished ? "badge--published" : "badge--draft"}`}
                  >
                    {article.isPublished ? "Опубликовано" : "Черновик"}
                  </span>
                </td>
                <td>
                  <div className="admin-articles__actions">
                    <Link
                      to={`/blog/${article.id}`}
                      className="btn btn--outline btn--sm"
                      title="Просмотр"
                    >
                      <EyeIcon className="btn__icon" />
                    </Link>
                    <button
                      className="btn btn--outline btn--sm btn--danger"
                      onClick={() => handleDeleteClick(article.id)}
                      disabled={deletingId === article.id}
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

      {filteredArticles.length === 0 && (
        <div className="admin-articles__empty">
          <DocumentTextIcon className="admin-articles__empty-icon" />
          <p>Статьи не найдены</p>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить эту статью?</p>
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

export default AdminArticles;
