import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DocumentTextIcon,
  PlusIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createBlogArticle, uploadArticleImage } from "../services/blogService";
import { useAuth } from "../context/AuthContext";
import "./CreateArticlePage.css";

const CreateArticlePage = () => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Допустимые форматы: JPEG, PNG, WebP, GIF");
      return;
    }

    // Проверка размера (макс. 10 МБ)
    if (file.size > 10 * 1024 * 1024) {
      setError("Размер файла не должен превышать 10 МБ");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Введите название статьи");
      return;
    }
    if (!form.content.trim()) {
      setError("Введите содержание статьи");
      return;
    }
    if (!currentUser?.userId) {
      setError("Ошибка: пользователь не определён");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Сначала создаём статью без изображения
      const articleId = await createBlogArticle({
        title: form.title.trim(),
        content: form.content.trim(),
        excerpt: form.excerpt.trim() || null,
        authorId: currentUser.userId,
        imageUrl: null,
      });

      // Если есть изображение, загружаем его
      if (imageFile) {
        setUploadingImage(true);
        try {
          await uploadArticleImage(articleId, imageFile);
        } finally {
          setUploadingImage(false);
        }
      }

      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.userId) {
    return (
      <div className="create-article">
        <div className="empty-state">
          <DocumentTextIcon className="empty-state__icon" />
          <p>Войдите в аккаунт, чтобы создавать статьи</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-article">
      <div className="create-article__container">
        <div className="create-article__header">
          <h1>Новая статья</h1>
          <p>Напишите статью для блога мастерской</p>
        </div>

        {error && <p className="server-error">{error}</p>}
        {success && (
          <p
            style={{
              color: "#4ade80",
              fontSize: 14,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <PlusIcon style={{ width: 16, height: 16 }} /> Статья создана!
          </p>
        )}

        <form
          className="create-article__form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="create-article__field">
            <label className="create-article__label">Название *</label>
            <input
              className="create-article__input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Заголовок вашей статьи"
            />
          </div>

          <div className="create-article__field">
            <label className="create-article__label">Изображение статьи</label>
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Превью статьи" />
                <button
                  type="button"
                  className="image-preview__remove"
                  onClick={removeImage}
                >
                  <XMarkIcon className="image-preview__icon" />
                </button>
              </div>
            ) : (
              <div className="image-upload">
                <input
                  type="file"
                  id="article-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-upload__input"
                />
                <label htmlFor="article-image" className="image-upload__label">
                  <PhotoIcon className="image-upload__icon" />
                  <span>Нажмите или перетащите изображение</span>
                  <span className="image-upload__hint">
                    JPEG, PNG, WebP, GIF до 10 МБ
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="create-article__field">
            <label className="create-article__label">Краткое описание</label>
            <input
              className="create-article__input"
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Краткое описание для карточки статьи"
            />
          </div>

          <div className="create-article__field create-article__field--full">
            <label className="create-article__label">Содержание *</label>
            <textarea
              className="create-article__textarea"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Текст вашей статьи..."
              rows={12}
            />
          </div>

          <div className="create-article__actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => navigate("/dashboard")}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading || uploadingImage}
            >
              {loading
                ? uploadingImage
                  ? "Загрузка изображения..."
                  : "Публикация..."
                : "Опубликовать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticlePage;
