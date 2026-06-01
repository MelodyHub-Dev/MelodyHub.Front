import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  getPendingArticleComments,
  approveArticleComment,
  deleteArticleComment,
} from "../services/articleCommentService";
import "./AdminComments.css";

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getPendingArticleComments();
      setComments(data.comments || []);
    } catch (err) {
      setError(err.message || "Ошибка загрузки комментариев");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId) => {
    try {
      setActionLoadingId(commentId);
      await approveArticleComment(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (err) {
      alert(err.message || "Ошибка одобрения комментария");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteClick = (commentId) => {
    setConfirmDeleteId(commentId);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;

    try {
      setActionLoadingId(confirmDeleteId);
      await deleteArticleComment(confirmDeleteId);
      setComments((prev) =>
        prev.filter((comment) => comment.id !== confirmDeleteId),
      );
    } catch (err) {
      alert(err.message || "Ошибка удаления комментария");
    } finally {
      setActionLoadingId(null);
      setShowConfirm(false);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setConfirmDeleteId(null);
  };

  return (
    <div className="admin-comments">
      <div className="admin-comments__header">
        <Link to="/admin" className="admin-comments__back">
          <ArrowLeftIcon className="admin-comments__back-icon" /> Назад в панель
        </Link>
        <h1>Модерация комментариев</h1>
        <p className="admin-comments__subtitle">
          Просмотрите новые комментарии и утвердите или удалите их.
        </p>
      </div>

      {loading ? (
        <div className="admin-comments__message">Загрузка...</div>
      ) : error ? (
        <div className="admin-comments__error">{error}</div>
      ) : comments.length === 0 ? (
        <div className="admin-comments__empty">
          <ExclamationTriangleIcon className="admin-comments__empty-icon" />
          Нет комментариев на модерации.
        </div>
      ) : (
        <div className="admin-comments__table-wrapper">
          <table className="admin-comments__table">
            <thead>
              <tr>
                <th>Автор</th>
                <th>Статья</th>
                <th>Комментарий</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id}>
                  <td>
                    <div className="admin-comments__author">
                      <UserCircleIcon className="admin-comments__author-icon" />
                      <span>{comment.username || "Гость"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-comments__article-title">
                      {comment.articleTitle || comment.articleId}
                    </div>
                  </td>
                  <td>
                    <div className="admin-comments__content">
                      {comment.content}
                    </div>
                  </td>
                  <td>{new Date(comment.createdAt).toLocaleString("ru-RU")}</td>
                  <td>
                    <div className="admin-comments__actions">
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={() => handleApprove(comment.id)}
                        disabled={actionLoadingId === comment.id}
                      >
                        <CheckCircleIcon className="admin-comments__action-icon" />
                        Одобрить
                      </button>
                      <button
                        className="btn btn--outline btn--sm btn--danger"
                        onClick={() => handleDeleteClick(comment.id)}
                        disabled={actionLoadingId === comment.id}
                      >
                        <TrashIcon className="admin-comments__action-icon" />
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConfirm && (
        <div className="admin-comments__modal-overlay" onClick={cancelDelete}>
          <div
            className="admin-comments__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Удалить комментарий?</h3>
            <p>Это действие нельзя отменить. Вы уверены?</p>
            <div className="admin-comments__modal-actions">
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Отмена
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComments;
