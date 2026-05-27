import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getInstrumentCategories,
  createInstrumentCategory,
  deleteInstrumentCategory,
} from "../services/instrumentCategoryService";
import "./AdminInstrumentCategories.css";

const AdminInstrumentCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query) ||
        category.slug?.toLowerCase().includes(query),
    );
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const generateSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getInstrumentCategories();
      setCategories(data.instrumentCategories || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Введите название категории");
      return;
    }

    if (!formData.slug.trim()) {
      setFormError("Slug категории не может быть пустым");
      return;
    }

    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        slug: formData.slug,
      };
      const categoryId = await createInstrumentCategory(data);
      setCategories((prev) => [...prev, { id: categoryId, ...data }]);
      setSuccessMessage("Категория успешно добавлена");
      setFormData({ name: "", description: "", slug: "" });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setFormError(err.message || "Не удалось создать категорию");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить категорию инструмента?")) return;

    try {
      setDeletingId(id);
      await deleteInstrumentCategory(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (err) {
      setError(err.message || "Не удалось удалить категорию");
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name") {
        next.slug = generateSlug(value);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="admin-categories">
        <div className="admin-categories__loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-categories">
        <div className="admin-categories__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-categories">
      <div className="admin-categories__header">
        <Link to="/admin" className="admin-categories__back">
          <ArrowLeftIcon className="admin-categories__back-icon" />
          Назад
        </Link>
        <h1>Категории инструментов</h1>
        <span className="admin-categories__count">
          {filteredCategories.length} из {categories.length}
        </span>
      </div>

      <div className="admin-categories__top-row">
        <div className="admin-categories__left-column">
          <form className="admin-categories__form" onSubmit={handleSubmit}>
            <div className="admin-categories__form-row">
              <label>Название</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Название категории"
              />
            </div>
            <div className="admin-categories__form-row">
              <label>Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="slug-kategorii"
              />
            </div>
            <div className="admin-categories__form-row admin-categories__form-row--full">
              <label>Описание</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Описание категории"
                rows={3}
              />
            </div>

            {formError && (
              <div className="admin-categories__form-error">{formError}</div>
            )}
            {successMessage && (
              <div className="admin-categories__form-success">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary admin-categories__submit"
            >
              <PlusIcon className="admin-categories__submit-icon" />
              Добавить категорию
            </button>
          </form>

          <div className="admin-categories__search admin-categories__search--below">
            <MagnifyingGlassIcon className="admin-categories__search-icon" />
            <input
              type="text"
              placeholder="Поиск категорий..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-categories__search-input"
            />
          </div>
        </div>
      </div>

      <div className="admin-categories__table-container">
        <table className="admin-categories__table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Slug</th>
              <th>Описание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td>{category.name || "-"}</td>
                <td>{category.slug || "-"}</td>
                <td>{category.description || "-"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                  >
                    <TrashIcon className="btn__icon" />
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInstrumentCategories;
