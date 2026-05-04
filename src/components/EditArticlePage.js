import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DocumentTextIcon,
  PlusIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import {
  getBlogArticleDetails,
  updateBlogArticle,
  uploadArticleImage,
} from "../services/blogService";
import { useAuth } from "../context/AuthContext";
import "./EditArticlePage.css";

const EditArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
  });
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await getBlogArticleDetails(id);
      setForm({
        title: data.title || "",
        content: data.content || "",
        excerpt: data.excerpt || "",
      });
      setExistingImageUrl(data.imageUrl || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Допустимые форматы: JPEG, PNG, WebP, GIF");
      return;
    }

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
    setDeleteImage(true);
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

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await updateBlogArticle({
        id: id,
        title: form.title.trim(),
        content: form.content.trim(),
        excerpt: form.excerpt.trim() || null,
        authorId: currentUser.userId,
        imageUrl: deleteImage ? null : existingImageUrl,
        deleteImage: deleteImage,
      });

      if (imageFile) {
        setUploadingImage(true);
        try {
          await uploadArticleImage(id, imageFile);
        } finally {
          setUploadingImage(false);
        }
      }

      setSuccess(true);
      setTimeout(() => navigate(`/blog/${id}`), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-article">
        <div className="edit-article__loading">Загрузка статьи...</div>
      </div>
    );
  }

  if (error && !form.title) {
    return (
      <div className="edit-article">
        <div className="edit-article__error">
          <p>Ошибка: {error}</p>
          <button
            className="btn btn--outline"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeftIcon className="btn-icon" /> Вернуться в панель
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-article">
      <div className="edit-article__container">
        <div className="edit-article__header">
          <button
            className="edit-article__back"
            onClick={() => navigate(`/blog/${id}`)}
          >
            <ArrowLeftIcon className="edit-article__back-icon" />
            Назад к статье
          </button>
          <h1>Редактирование статьи</h1>
          <p>Измените информацию о статье</p>
        </div>

        {error && <p className="server-error">{error}</p>}
        {success && (
          <p
            className="edit-article__success"
            style={{
              color: "#4ade80",
              fontSize: 14,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <PlusIcon style={{ width: 16, height: 16 }} /> Статья обновлена!
          </p>
        )}

        <form className="edit-article__form" onSubmit={handleSubmit} noValidate>
          <div className="edit-article__field">
            <label className="edit-article__label">Название *</label>
            <input
              className="edit-article__input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Заголовок вашей статьи"
            />
          </div>

          <div className="edit-article__field">
            <label className="edit-article__label">Изображение статьи</label>
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
            ) : existingImageUrl ? (
              <div className="image-preview">
                <img src={existingImageUrl} alt="Текущее изображение" />
                {imageFile === null && (
                  <button
                    type="button"
                    className="image-preview__remove"
                    onClick={() => setExistingImageUrl(null)}
                    title="Удалить изображение"
                  >
                    <XMarkIcon className="image-preview__icon" />
                  </button>
                )}
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

          <div className="edit-article__field">
            <label className="edit-article__label">Краткое описание</label>
            <input
              className="edit-article__input"
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Краткое описание для карточки статьи"
            />
          </div>

          <div className="edit-article__field edit-article__field--full">
            <label className="edit-article__label">Содержание *</label>
            <textarea
              className="edit-article__textarea"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Текст вашей статьи..."
              rows={12}
            />
          </div>

          <div className="edit-article__actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => navigate(`/blog/${id}`)}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={saving || uploadingImage}
            >
              {saving
                ? uploadingImage
                  ? "Загрузка изображения..."
                  : "Сохранение..."
                : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArticlePage;
