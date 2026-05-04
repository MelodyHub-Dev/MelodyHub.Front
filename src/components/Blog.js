import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { getAllBlogArticles } from "../services/blogService";
import "./Blog.css";

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await getAllBlogArticles();
      setArticles(data.blogArticles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      article.title?.toLowerCase().includes(searchLower) ||
      article.excerpt?.toLowerCase().includes(searchLower) ||
      article.authorName?.toLowerCase().includes(searchLower)
    );
  });

  const getRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Сегодня";
    if (diffDays === 1) return "Вчера";
    if (diffDays < 7) return `${diffDays} дня назад`;
    return `${diffDays} дней назад`;
  };

  if (loading) {
    return (
      <div className="blog-container">
        <div className="loading">Загрузка статей...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-container">
        <div className="error">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Блог</h1>
        <p>Статьи от авторов мастерской</p>
      </div>

      <div className="blog-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск статей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="blog-grid">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="blog-card"
            onClick={() => navigate(`/blog/${article.id}`)}
          >
            {article.imageUrl && (
              <div className="card-image">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="card-content">
              <div className="card-meta">
                <span className="author-name">
                  {article.authorName || "Автор"}
                </span>
                <span className="date">
                  {getRelativeDate(article.publishedAt || article.createdAt)}
                </span>
              </div>
              <h2 className="card-title">{article.title}</h2>
              {article.excerpt && (
                <p className="card-excerpt">{article.excerpt}</p>
              )}
              <div className="card-stats">
                <span className="stat views">
                  <EyeIcon className="stat-icon" /> {article.viewsCount}
                </span>
                <span className="stat comments">
                  <ChatBubbleLeftIcon className="stat-icon" />{" "}
                  {article.commentCount}
                </span>
                {article.isNew && <span className="stat new">Новое</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="no-results">
          <p>Статьи не найдены</p>
          <p>Попробуйте изменить параметры поиска</p>
        </div>
      )}
    </div>
  );
};

export default Blog;
