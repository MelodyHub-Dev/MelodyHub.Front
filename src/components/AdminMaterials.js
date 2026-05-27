import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getMaterials,
  createMaterial,
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
  });
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        unit: Number(formData.unit),
        avgPrice: Number(formData.avgPrice) || 0,
        category: formData.category.trim() || null,
      };
      const materialId = await createMaterial(data);
      setMaterials((prev) => [
        ...prev,
        { id: materialId, ...data, unit: Number(data.unit) },
      ]);
      setSuccessMessage("Материал успешно добавлен");
      setFormData({
        name: "",
        description: "",
        unit: 0,
        avgPrice: 0,
        category: "",
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setFormError(err.message || "Не удалось создать материал");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить материал?")) return;

    try {
      setDeletingId(id);
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((material) => material.id !== id));
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

            <button
              type="submit"
              className="btn btn--primary admin-materials__submit"
            >
              <PlusIcon className="admin-materials__submit-icon" />
              Добавить материал
            </button>
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
                    className="btn btn--danger btn--sm"
                    onClick={() => handleDelete(material.id)}
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
    </div>
  );
};

export default AdminMaterials;
