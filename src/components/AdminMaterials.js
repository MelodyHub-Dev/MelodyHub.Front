import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  uploadMaterialImage,
  deleteMaterial,
} from "../services/materialService";
import "./AdminMaterials.css";

const MATERIAL_UNITS = [
  { value: 0, label: "шт." },
  { value: 1, label: "м" },
  { value: 2, label: "м²" },
  { value: 3, label: "кг" },
  { value: 4, label: "л" },
];

const AdminMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: 0,
    avgPrice: 0,
    category: "",
    imageUrl: "",
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMaterials(materials);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = materials.filter(
      (material) =>
        material.name?.toLowerCase().includes(query) ||
        material.category?.toLowerCase().includes(query),
    );
    setFilteredMaterials(filtered);
  }, [searchQuery, materials]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await getMaterials();
      setMaterials(data.materials || data || []);
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
      setFormError("Введите название материала");
      return;
    }

    try {
      const baseData = {
        id: editingId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        unit: Number(formData.unit),
        avgPrice: Number(formData.avgPrice) || 0,
        category: formData.category.trim() || null,
      };

      let updatedMaterial = {
        ...baseData,
        unit: Number(baseData.unit),
      };

      if (editingId) {
        await updateMaterial(baseData);
        if (selectedImageFile) {
          const result = await uploadMaterialImage(
            editingId,
            selectedImageFile,
          );
          updatedMaterial = { ...updatedMaterial, imageUrl: result.imageUrl };
        }

        setMaterials((prev) =>
          prev.map((material) =>
            material.id === editingId
              ? { ...material, ...updatedMaterial }
              : material,
          ),
        );
        setSuccessMessage("Материал успешно обновлен");
      } else {
        const materialId = await createMaterial(baseData);
        if (selectedImageFile) {
          const result = await uploadMaterialImage(
            materialId,
            selectedImageFile,
          );
          updatedMaterial = { ...updatedMaterial, imageUrl: result.imageUrl };
        }

        setMaterials((prev) => [
          ...prev,
          { id: materialId, ...updatedMaterial },
        ]);
        setSuccessMessage("Материал успешно добавлен");
      }

      setFormData({
        name: "",
        description: "",
        unit: 0,
        avgPrice: 0,
        category: "",
        imageUrl: "",
      });
      setSelectedImageFile(null);
      setImagePreviewUrl("");
      setEditingId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setFormError(
        err.message ||
          (editingId
            ? "Не удалось обновить материал"
            : "Не удалось создать материал"),
      );
    }
  };

  const handleEdit = (material) => {
    setEditingId(material.id);
    setFormData({
      name: material.name || "",
      description: material.description || "",
      unit: material.unit ?? 0,
      avgPrice: material.avgPrice ?? 0,
      category: material.category || "",
      imageUrl: material.imageUrl || "",
    });
    setSelectedImageFile(null);
    setImagePreviewUrl(material.imageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      unit: 0,
      avgPrice: 0,
      category: "",
      imageUrl: "",
    });
    setSelectedImageFile(null);
    setImagePreviewUrl("");
    setFormError(null);
    setSuccessMessage(null);
  };

  const openDeleteModal = (id) => {
    setConfirmDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setConfirmDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;

    try {
      setDeletingId(confirmDeleteId);
      await deleteMaterial(confirmDeleteId);
      setMaterials((prev) => prev.filter((material) => material.id !== confirmDeleteId));
      setShowDeleteConfirm(false);
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.message || "Не удалось удалить материал");
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedImageFile(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    } else {
      setImagePreviewUrl(formData.imageUrl || "");
    }
  };

  if (loading) {
    return (
      <div className="admin-materials">
        <div className="admin-materials__loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-materials">
        <div className="admin-materials__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-materials">
      <div className="admin-materials__header">
        <Link to="/admin" className="admin-materials__back">
          <ArrowLeftIcon className="admin-materials__back-icon" />
          Назад
        </Link>
        <h1>Управление материалами</h1>
        <span className="admin-materials__count">
          {filteredMaterials.length} из {materials.length}
        </span>
      </div>

      <div className="admin-materials__top-row">
        <div className="admin-materials__left-column">
          <form className="admin-materials__form" onSubmit={handleSubmit}>
            <div className="admin-materials__form-row">
              <label>Название</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Название материала"
              />
            </div>
            <div className="admin-materials__form-row">
              <label>Категория</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Категория"
              />
            </div>
            <div className="admin-materials__form-row">
              <label>Ед. измерения</label>
              <select name="unit" value={formData.unit} onChange={handleChange}>
                {MATERIAL_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-materials__form-row">
              <label>Средняя цена</label>
              <input
                type="number"
                name="avgPrice"
                value={formData.avgPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="admin-materials__form-row">
              <label>Изображение материала</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            {imagePreviewUrl && (
              <div className="admin-materials__image-preview">
                <img
                  src={imagePreviewUrl}
                  alt="Превью материала"
                  className="admin-materials__image"
                  onError={(e) => {
                    const target = e.target;
                    if (target instanceof HTMLImageElement) {
                      target.style.display = "none";
                    }
                  }}
                />
              </div>
            )}
            <div className="admin-materials__form-row admin-materials__form-row--full">
              <label>Описание</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Описание материала"
                rows={3}
              />
            </div>

            {formError && (
              <div className="admin-materials__form-error">{formError}</div>
            )}
            {successMessage && (
              <div className="admin-materials__form-success">
                {successMessage}
              </div>
            )}

            <div className="admin-materials__form-actions">
              <button
                type="submit"
                className="btn btn--primary admin-materials__submit"
              >
                <PlusIcon className="admin-materials__submit-icon" />
                {editingId ? "Сохранить изменения" : "Добавить материал"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn--secondary admin-materials__submit"
                  onClick={handleCancelEdit}
                >
                  Отменить
                </button>
              )}
            </div>
          </form>

          <div className="admin-materials__search admin-materials__search--below">
            <MagnifyingGlassIcon className="admin-materials__search-icon" />
            <input
              type="text"
              placeholder="Поиск материалов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-materials__search-input"
            />
          </div>
        </div>
      </div>

      <div className="admin-materials__table-container">
        <table className="admin-materials__table">
          <thead>
            <tr>
              <th>Изображение</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Ед. изм.</th>
              <th>Цена</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((material) => (
              <tr key={material.id}>
                <td>
                  {material.imageUrl ? (
                    <img
                      src={material.imageUrl}
                      alt={material.name}
                      className="admin-materials__row-image"
                      onError={(e) => {
                        const target = e.target;
                        if (target instanceof HTMLImageElement) {
                          target.style.display = "none";
                        }
                      }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{material.name || "-"}</td>
                <td>{material.category || "-"}</td>
                <td>
                  {MATERIAL_UNITS.find((unit) => unit.value === material.unit)
                    ?.label || material.unit}
                </td>
                <td>
                  {(material.avgPrice?.toFixed?.(2) ?? material.avgPrice) ||
                    "-"}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => handleEdit(material)}
                  >
                    <PencilSquareIcon className="btn__icon" />
                    Редактировать
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => openDeleteModal(material.id)}
                    disabled={deletingId === material.id}
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

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить этот материал?</p>
            <div className="modal__actions">
              <button className="btn btn--outline" onClick={handleCancelDelete}>
                Отмена
              </button>
              <button
                className="btn btn--primary btn--danger"
                onClick={handleConfirmDelete}
                disabled={deletingId === confirmDeleteId}
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

export default AdminMaterials;
