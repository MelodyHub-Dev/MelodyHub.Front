import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  EyeIcon,
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  getBlogArticleDetails,
  incrementArticleViews,
} from "../services/blogService";
import {
  getArticleComments,
  createArticleComment,
  updateArticleComment,
  deleteArticleComment,
} from "../services/articleCommentService";
import { getSession } from "../services/authService";
import "./BlogArticlePage.css";

const BlogArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const session = getSession();

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await getBlogArticleDetails(id);
      setArticle(data);
      await loadComments(data.id);

      // Увеличиваем счётчик просмотров
      try {
        await incrementArticleViews(id);
      } catch (err) {
        console.error("Ошибка увеличения просмотров:", err);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (articleId) => {
    try {
      const data = await getArticleComments(articleId);
      setComments(data.comments || []);
    } catch (err) {
      console.error("Ошибка загрузки комментариев:", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const session = getSession();
    if (!session || !session.userId) {
      setCommentError("Для добавления комментария необходимо войти в систему");
      return;
    }

    try {
      setSubmitting(true);
      setCommentError("");
      await createArticleComment({
        articleId: article.id,
        userId: session.userId,
        content: newComment.trim(),
      });
      setNewComment("");
      await loadComments(article.id);
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);
    setShowDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!deletingCommentId) return;

    try {
      await deleteArticleComment(deletingCommentId);
      await loadComments(article.id);
      setArticle((prev) => ({
        ...prev,
        commentCount: Math.max(0, (prev.commentCount || 1) - 1),
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setShowDeleteModal(false);
      setDeletingCommentId(null);
    }
  };

  const cancelDeleteComment = () => {
    setShowDeleteModal(false);
    setDeletingCommentId(null);
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const saveEditComment = async () => {
    if (!editContent.trim() || !editingCommentId) return;

    const comment = comments.find((c) => c.id === editingCommentId);
    if (!comment) return;

    try {
      setEditSubmitting(true);
      await updateArticleComment({
        id: editingCommentId,
        articleId: article.id,
        userId: comment.userId,
        content: editContent.trim(),
        parentCommentId: comment.parentCommentId,
      });
      setEditingCommentId(null);
      setEditContent("");
      await loadComments(article.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="article-page-container">
        <div className="loading">Загрузка статьи...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-page-container">
        <div className="error">Ошибка: {error}</div>
        <button className="btn-back" onClick={() => navigate("/blog")}>
          <ArrowLeftIcon className="btn-icon" /> Вернуться к блогу
        </button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-page-container">
        <div className="error">Статья не найдена</div>
        <button className="btn-back" onClick={() => navigate("/blog")}>
          <ArrowLeftIcon className="btn-icon" /> Вернуться к блогу
        </button>
      </div>
    );
  }

  return (
    <div className="article-page-container">
      <button className="btn-back" onClick={() => navigate("/blog")}>
        Назад к блогу
      </button>

      <article className="article-content">
        <header className="article-header">
          <h1 className="article-title">{article.title}</h1>

          <div className="article-meta">
            <span className="meta-author">
              <UserIcon className="meta-icon" />
              {article.authorName || "Автор"}
            </span>
            <span className="meta-date">
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
          </div>

          <div className="article-stats">
            <span className="stat">
              <EyeIcon className="stat-icon" /> {article.viewsCount}
            </span>
            <span className="stat">
              <ChatBubbleLeftIcon className="stat-icon" /> {comments.length}
            </span>
          </div>
        </header>

        {article.imageUrl && (
          <div className="article-image">
            <img src={article.imageUrl} alt={article.title} />
          </div>
        )}

        <div className="article-body">
          {article.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <section className="comments-section">
          <h2 className="comments-title">Комментарии ({comments.length})</h2>

          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              className="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий..."
              rows={3}
            />
            {commentError && (
              <div className="comment-error">{commentError}</div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? "Отправка..." : "Добавить комментарий"}
            </button>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">
                Пока нет комментариев. Будьте первым!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.username || "Пользователь"}
                    </span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {session && session.userId === comment.userId && (
                      <>
                        <button
                          className="btn-edit-comment"
                          onClick={() => startEditComment(comment)}
                          title="Редактировать комментарий"
                        >
                          <PencilIcon className="icon-small" />
                        </button>
                        <button
                          className="btn-delete-comment"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Удалить комментарий"
                        >
                          <TrashIcon className="icon-small" />
                        </button>
                      </>
                    )}
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="comment-edit-form">
                      <textarea
                        className="comment-edit-input"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="comment-edit-actions">
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={cancelEditComment}
                          disabled={editSubmitting}
                        >
                          <XMarkIcon className="icon-small" /> Отмена
                        </button>
                        <button
                          className="btn btn-primary btn-small"
                          onClick={saveEditComment}
                          disabled={editSubmitting || !editContent.trim()}
                        >
                          <CheckIcon className="icon-small" />{" "}
                          {editSubmitting ? "Сохранение..." : "Сохранить"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="comment-content">{comment.content}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </article>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDeleteComment}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Удаление комментария</h3>
            <p className="modal-text">
              Вы уверены, что хотите удалить этот комментарий?
            </p>
            <div className="modal-buttons">
              <button
                className="btn btn-secondary"
                onClick={cancelDeleteComment}
              >
                Отмена
              </button>
              <button className="btn btn-danger" onClick={confirmDeleteComment}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogArticlePage;
