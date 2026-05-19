import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  getInstruments,
  deleteInstrument,
  createInstrument,
  updateInstrument,
  getInstrumentCategories,
  getMaterials,
  uploadInstrumentImage,
} from "../services/instrumentService";
import "./AdminInstruments.css";

const AdminInstruments = () => {
  const [instruments, setInstruments] = useState([]);
  const [filteredInstruments, setFilteredInstruments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmInstrumentId, setConfirmInstrumentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    difficulty: 0,
    estimatedHours: 0,
    mainImageUrl: "",
    viewsCount: 0,
    categoryId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterInstruments();
  }, [searchQuery, instruments]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [instrumentsData, categoriesData, materialsData] =
        await Promise.all([
          getInstruments(),
          getInstrumentCategories(),
          getMaterials(),
        ]);
      setInstruments(instrumentsData?.instruments || instrumentsData || []);
      setCategories(
        categoriesData?.instrumentCategories || categoriesData || [],
      );
      setMaterials(materialsData?.materials || materialsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterInstruments = () => {
    if (!searchQuery.trim()) {
      setFilteredInstruments(instruments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = instruments.filter(
      (instrument) =>
        instrument.name?.toLowerCase().includes(query) ||
        instrument.shortDescription?.toLowerCase().includes(query),
    );
    setFilteredInstruments(filtered);
  };

  const handleDeleteClick = (id) => {
    setConfirmInstrumentId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmInstrumentId) return;

    try {
      setDeletingId(confirmInstrumentId);
      await deleteInstrument(confirmInstrumentId);
      setInstruments(instruments.filter((i) => i.id !== confirmInstrumentId));
    } catch (err) {
      alert("Ошибка удаления: " + err.message);
    } finally {
      setDeletingId(null);
      setShowConfirm(false);
      setConfirmInstrumentId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setConfirmInstrumentId(null);
  };

  const handleOpenModal = (instrument = null) => {
    if (instrument) {
      setEditingInstrument(instrument);
      setFormData({
        name: instrument.name || "",
        description: instrument.description || "",
        shortDescription: instrument.shortDescription || "",
        difficulty: instrument.difficulty || 0,
        estimatedHours: instrument.estimatedHours || 0,
        mainImageUrl: instrument.mainImageUrl || "",
        viewsCount: instrument.viewsCount || 0,
        categoryId: instrument.categoryId || "",
      });
      setImagePreview(instrument.mainImageUrl || null);
      setImageFile(null);
    } else {
      setEditingInstrument(null);
      setFormData({
        name: "",
        description: "",
        shortDescription: "",
        difficulty: 0,
        estimatedHours: 0,
        mainImageUrl: "",
        viewsCount: 0,
        categoryId: "",
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInstrument(null);
    setFormData({
      name: "",
      description: "",
      shortDescription: "",
      difficulty: 0,
      estimatedHours: 0,
      mainImageUrl: "",
      viewsCount: 0,
      categoryId: "",
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, mainImageUrl: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name || formData.name.length < 2) {
      alert("Название должно содержать минимум 2 символа");
      return;
    }

    if (!formData.description || formData.description.length < 20) {
      alert("Описание должно содержать минимум 20 символов");
      return;
    }

    if (formData.shortDescription && formData.shortDescription.length < 10) {
      alert("Краткое описание должно содержать минимум 10 символов");
      return;
    }

    if (!formData.categoryId) {
      alert("Выберите категорию");
      return;
    }

    try {
      setUploading(true);

      let imageUrl = formData.mainImageUrl;

      // Upload image if a new file was selected
      if (imageFile) {
        if (editingInstrument) {
          const result = await uploadInstrumentImage(
            editingInstrument.id,
            imageFile,
          );
          imageUrl = result.imageUrl;
        } else {
          // For new instruments, create first, then upload image
          const instrumentId = await createInstrument(formData);
          const result = await uploadInstrumentImage(instrumentId, imageFile);
          imageUrl = result.imageUrl;
          setInstruments([
            ...instruments,
            { id: instrumentId, ...formData, mainImageUrl: imageUrl },
          ]);
          handleCloseModal();
          return;
        }
      }

      if (editingInstrument) {
        await updateInstrument({
          id: editingInstrument.id,
          ...formData,
          mainImageUrl: imageUrl,
        });
        setInstruments(
          instruments.map((i) =>
            i.id === editingInstrument.id
              ? { ...i, ...formData, mainImageUrl: imageUrl }
              : i,
          ),
        );
      }

      handleCloseModal();
    } catch (err) {
      alert("Ошибка: " + (err.message || "Не удалось сохранить инструмент"));
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  if (loading) {
    return (
      <div className="admin-instruments">
        <div className="admin-instruments__loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-instruments">
        <div className="admin-instruments__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-instruments">
      <div className="admin-instruments__header">
        <Link to="/admin" className="admin-instruments__back">
          <ArrowLeftIcon className="admin-instruments__back-icon" />
          Назад
        </Link>
        <h1>Управление инструментами</h1>
        <button
          className="admin-instruments__add-btn"
          onClick={() => handleOpenModal()}
        >
          <PlusIcon className="admin-instruments__add-icon" />
          Добавить инструмент
        </button>
      </div>

      <div className="admin-instruments__search">
        <MagnifyingGlassIcon className="admin-instruments__search-icon" />
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-instruments__search-input"
        />
      </div>

      <div className="admin-instruments__table-container">
        <table className="admin-instruments__table">
          <thead>
            <tr>
              <th>Инструмент</th>
              <th>Описание</th>
              <th>Сложность</th>
              <th>Часы</th>
              <th>Просмотры</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstruments?.map((instrument) => (
              <tr key={instrument.id}>
                <td>
                  <div className="admin-instruments__instrument">
                    {instrument.mainImageUrl ? (
                      <img
                        src={instrument.mainImageUrl}
                        alt={instrument.name}
                        className="admin-instruments__image"
                      />
                    ) : (
                      <div className="admin-instruments__icon">
                        <WrenchScrewdriverIcon className="admin-instruments__icon-svg" />
                      </div>
                    )}
                    <div className="admin-instruments__info">
                      <span className="admin-instruments__name">
                        {instrument.name || "Без названия"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="admin-instruments__description-cell">
                  {instrument.shortDescription || "-"}
                </td>
                <td>
                  <span
                    className={`badge badge--${instrument.difficulty === 0 ? "published" : "draft"}`}
                  >
                    {instrument.difficulty === 0
                      ? "Начинающий"
                      : instrument.difficulty === 1
                        ? "Средний"
                        : "Продвинутый"}
                  </span>
                </td>
                <td>{instrument.estimatedHours || "-"}</td>
                <td>{instrument.viewsCount || 0}</td>
                <td>
                  <div className="admin-instruments__actions">
                    <Link
                      to={`/instrument/${instrument.id}`}
                      className="btn btn--outline btn--sm"
                      title="Просмотр"
                    >
                      <EyeIcon className="btn__icon" />
                    </Link>
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => handleOpenModal(instrument)}
                      title="Редактировать"
                    >
                      <PencilIcon className="btn__icon" />
                    </button>
                    <button
                      className="btn btn--outline btn--sm btn--danger"
                      onClick={() => handleDeleteClick(instrument.id)}
                      disabled={deletingId === instrument.id}
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

      {filteredInstruments.length === 0 && (
        <div className="admin-instruments__empty">
          <WrenchScrewdriverIcon className="admin-instruments__empty-icon" />
          <p>Инструменты не найдены</p>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить этот инструмент?</p>
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

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
            <h3>{editingInstrument ? "Редактирование" : "Добавление"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Название * (минимум 2 символа)</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Например: Акустическая гитара"
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoryId">Категория *</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Описание * (минимум 20 символов)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Подробное описание инструмента..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="shortDescription">
                  Краткое описание (минимум 10 символов, если заполнено)
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Краткое описание для карточек..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="difficulty">Сложность</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    <option value={0}>Начинающий</option>
                    <option value={1}>Средний</option>
                    <option value={2}>Продвинутый</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="estimatedHours">Примерное время (часы)</label>
                  <input
                    type="number"
                    id="estimatedHours"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleChange}
                    min="0"
                    placeholder="Например: 40"
                  />
                </div>
              </div>

              {materials.length > 0 && (
                <div className="form-group">
                  <label>Материалы</label>
                  <div className="form-checkbox-group">
                    {materials.map((material) => (
                      <label key={material.id} className="form-checkbox">
                        <input
                          type="checkbox"
                          name="materialIds"
                          value={material.id}
                          checked={
                            formData.materialIds &&
                            formData.materialIds.includes(material.id)
                          }
                          onChange={handleChange}
                        />
                        <span>{material.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Изображение</label>
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Превью" />
                    <button
                      type="button"
                      className="image-preview__remove"
                      onClick={handleRemoveImage}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="image-upload">
                    <input
                      type="file"
                      id="imageFile"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-upload__input"
                    />
                    <label htmlFor="imageFile" className="image-upload__label">
                      <span>Выберите файл</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="modal__actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={handleCloseModal}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn--primary">
                  {editingInstrument ? "Сохранить" : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInstruments;
