import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getBlueprints,
  getBlueprintDetails,
  createBlueprint,
  updateBlueprint,
  deleteBlueprint,
  uploadBlueprintImage,
  uploadBlueprintVideo,
} from "../services/instructionService";
import { getInstruments } from "../services/instrumentService";
import "./AdminInstructions.css";

const initialFormData = {
  id: "",
  instrumentId: "",
  title: "",
  stepNumber: 1,
  content: "",
  imageUrl: "",
  videoUrl: "",
  estimatedTimeMinutes: "",
};

const AdminInstructions = () => {
  const [instructions, setInstructions] = useState([]);
  const [filteredInstructions, setFilteredInstructions] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [selectedInstruction, setSelectedInstruction] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const formRef = useRef(null);
  const detailsRef = useRef(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredInstructions(instructions);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredInstructions(
      instructions.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.content?.toLowerCase().includes(query) ||
          item.stepNumber?.toString()?.includes(query),
      ),
    );
  }, [searchQuery, instructions]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [blueprintsData, instrumentsData] = await Promise.all([
        getBlueprints(),
        getInstruments(),
      ]);
      setInstructions(blueprintsData?.blueprints || blueprintsData || []);
      setFilteredInstructions(
        blueprintsData?.blueprints || blueprintsData || [],
      );
      setInstruments(instrumentsData?.instruments || instrumentsData || []);
    } catch (err) {
      setError(err.message || "Ошибка загрузки инструкций");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setFormError(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    if (formError) setFormError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (name === "imageFile") setImageFile(file);
    if (name === "videoFile") setVideoFile(file);
  };

  const validateForm = () => {
    if (!formData.instrumentId) return "Выберите инструмент";
    if (!formData.title.trim()) return "Введите название инструкции";
    if (!formData.content.trim()) return "Введите описание шага";
    if (!formData.stepNumber || Number(formData.stepNumber) < 1)
      return "Номер шага должен быть больше 0";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    // Проверка на дубликат шага внутри выбранного инструмента
    const stepNum = Number(formData.stepNumber);
    const duplicate = instructions.some((item) => {
      if (!formData.instrumentId) return false;
      return (
        item.instrumentId === formData.instrumentId &&
        Number(item.stepNumber) === stepNum &&
        (editingId ? item.id !== editingId : true)
      );
    });

    if (duplicate) {
      setFormError("Шаг с таким номером уже существует");
      return;
    }

    const payload = {
      instrumentId: formData.instrumentId,
      title: formData.title.trim(),
      stepNumber: Number(formData.stepNumber),
      content: formData.content.trim(),
      imageUrl: formData.imageUrl?.trim() || null,
      videoUrl: formData.videoUrl?.trim() || null,
      estimatedTimeMinutes:
        formData.estimatedTimeMinutes !== ""
          ? Number(formData.estimatedTimeMinutes)
          : null,
    };

    try {
      if (editingId) {
        // If new files selected, upload them first
        if (imageFile) {
          const res = await uploadBlueprintImage(editingId, imageFile);
          payload.imageUrl = res?.imageUrl || payload.imageUrl;
        }
        if (videoFile) {
          const res = await uploadBlueprintVideo(editingId, videoFile);
          payload.videoUrl = res?.videoUrl || payload.videoUrl;
        }

        await updateBlueprint({ id: editingId, ...payload });
        setInstructions((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? { ...item, ...payload, id: editingId }
              : item,
          ),
        );
        setFilteredInstructions((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? { ...item, ...payload, id: editingId }
              : item,
          ),
        );
        setSelectedInstruction((prev) =>
          prev?.id === editingId ? { ...prev, ...payload } : prev,
        );
        setSuccessMessage("Инструкция обновлена");
      } else {
        // create without files first to obtain id
        const createdId = await createBlueprint(payload);

        // upload files if any
        if (imageFile) {
          const res = await uploadBlueprintImage(createdId, imageFile);
          payload.imageUrl = res?.imageUrl || payload.imageUrl;
        }
        if (videoFile) {
          const res = await uploadBlueprintVideo(createdId, videoFile);
          payload.videoUrl = res?.videoUrl || payload.videoUrl;
        }

        // persist uploaded urls
        if (payload.imageUrl || payload.videoUrl) {
          await updateBlueprint({ id: createdId, ...payload });
        }

        const newItem = { id: createdId, ...payload };
        setInstructions((prev) => [...prev, newItem]);
        setFilteredInstructions((prev) => [...prev, newItem]);
        setSuccessMessage("Инструкция создана");
      }
      resetForm();
    } catch (err) {
      setFormError(err.message || "Не удалось сохранить инструкцию");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      id: item.id,
      instrumentId: item.instrumentId,
      title: item.title || "",
      stepNumber: item.stepNumber || 1,
      content: item.content || "",
      imageUrl: item.imageUrl || "",
      videoUrl: item.videoUrl || "",
      estimatedTimeMinutes: item.estimatedTimeMinutes ?? "",
    });
    setFormError(null);
    setSuccessMessage(null);

    // scroll to top where the form is
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleView = async (id) => {
    try {
      const details = await getBlueprintDetails(id);
      setSelectedInstruction(details);
    } catch (err) {
      setError(err.message || "Не удалось загрузить инструкцию");
    }
  };

  useEffect(() => {
    if (selectedInstruction) {
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedInstruction]);

  const openDeleteModal = (id) => {
    setDeleteCandidate(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteCandidate(null);
    setDeleteModalOpen(false);
  };

  const handleDeleteConfirmed = async () => {
    const id = deleteCandidate;
    if (!id) return;
    try {
      setDeletingId(id);
      await deleteBlueprint(id);
      setInstructions((prev) => prev.filter((item) => item.id !== id));
      setFilteredInstructions((prev) => prev.filter((item) => item.id !== id));
      if (selectedInstruction?.id === id) setSelectedInstruction(null);
      closeDeleteModal();
    } catch (err) {
      setError(err.message || "Ошибка удаления инструкции");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-instructions">
        <div className="admin-instructions__loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-instructions">
        <div className="admin-instructions__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-instructions">
      {deleteModalOpen && (
        <div className="admin-instructions__modal-overlay">
          <div className="admin-instructions__modal">
            <h3>Подтвердите удаление</h3>
            <p>Вы действительно хотите удалить эту инструкцию?</p>
            <div className="admin-instructions__modal-actions">
              <button
                className="btn btn--danger"
                onClick={handleDeleteConfirmed}
              >
                Удалить
              </button>
              <button className="btn btn--outline" onClick={closeDeleteModal}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="admin-instructions__header">
        <Link to="/admin" className="admin-instructions__back">
          <ArrowLeftIcon className="admin-instructions__back-icon" />
          Назад
        </Link>
        <h1>Управление инструкциями</h1>
        <span className="admin-instructions__count">
          {filteredInstructions.length} из {instructions.length}
        </span>
      </div>

      <div className="admin-instructions__top-row">
        <div className="admin-instructions__left-column">
          <form
            ref={formRef}
            className="admin-instructions__form"
            onSubmit={handleSubmit}
          >
            <div className="admin-instructions__form-row">
              <label>Инструмент</label>
              <select
                name="instrumentId"
                value={formData.instrumentId}
                onChange={handleChange}
              >
                <option value="">Выберите инструмент</option>
                {instruments.map((instrument) => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-instructions__form-row">
              <label>Название инструкции</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Например, Сборка гитары"
              />
            </div>

            <div className="admin-instructions__form-row admin-instructions__form-row--half">
              <label>Номер шага</label>
              <input
                type="number"
                name="stepNumber"
                min="1"
                value={formData.stepNumber}
                onChange={handleChange}
              />
            </div>

            <div className="admin-instructions__form-row admin-instructions__form-row--half">
              <label>Время, мин</label>
              <input
                type="number"
                name="estimatedTimeMinutes"
                min="0"
                value={formData.estimatedTimeMinutes}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="admin-instructions__form-row admin-instructions__form-row--full">
              <label>Описание шага</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={5}
                placeholder="Опишите действие, которое должен выполнить пользователь"
              />
            </div>

            <div className="admin-instructions__form-row">
              <label>Фото шага</label>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                onChange={handleFileChange}
              />
              {(imageFile || formData.imageUrl) && (
                <div className="admin-instructions__preview-row">
                  {imageFile && (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="preview"
                      className="admin-instructions__small-image"
                    />
                  )}
                  {!imageFile && formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="preview"
                      className="admin-instructions__small-image"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="admin-instructions__form-row">
              <label>Видео шага</label>
              <input
                type="file"
                name="videoFile"
                accept="video/*"
                onChange={handleFileChange}
              />
              {videoFile && (
                <div className="admin-instructions__preview-row">
                  <video
                    src={URL.createObjectURL(videoFile)}
                    controls
                    className="admin-instructions__small-video"
                  />
                </div>
              )}
              {!videoFile && formData.videoUrl && (
                <div className="admin-instructions__preview-row">
                  <video
                    src={formData.videoUrl}
                    controls
                    className="admin-instructions__small-video"
                  />
                </div>
              )}
            </div>

            {formError && (
              <div className="admin-instructions__form-error">{formError}</div>
            )}
            {successMessage && (
              <div className="admin-instructions__form-success">
                {successMessage}
              </div>
            )}

            <div className="admin-instructions__form-actions">
              <button type="submit" className="btn btn--primary">
                <PlusIcon className="btn__icon" />
                {editingId ? "Сохранить" : "Создать шаг"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={resetForm}
                >
                  Отменить
                </button>
              )}
            </div>
          </form>

          <div className="admin-instructions__search admin-instructions__search--below">
            <MagnifyingGlassIcon className="admin-instructions__search-icon" />
            <input
              type="text"
              placeholder="Поиск по инструкции или шагу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-instructions__search-input"
            />
          </div>
        </div>
      </div>

      <div className="admin-instructions__table-container">
        <table className="admin-instructions__table">
          <thead>
            <tr>
              <th>Инструмент</th>
              <th>Инструкция</th>
              <th>Шаг</th>
              <th>Время</th>
              <th>Фото</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstructions.map((item) => (
              <tr key={item.id}>
                <td>
                  {instruments.find((inst) => inst.id === item.instrumentId)
                    ?.name || "-"}
                </td>
                <td>{item.title || "-"}</td>
                <td>{item.stepNumber || "-"}</td>
                <td>{item.estimatedTimeMinutes ?? "-"}</td>
                <td>{item.imageUrl ? "Да" : "-"}</td>
                <td>
                  <div className="admin-instructions__actions">
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      title="Просмотр"
                      onClick={() => handleView(item.id)}
                    >
                      <EyeIcon className="btn__icon" />
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      title="Редактировать"
                      onClick={() => handleEdit(item)}
                    >
                      <PencilIcon className="btn__icon" />
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      title="Удалить"
                      onClick={() => openDeleteModal(item.id)}
                      disabled={deletingId === item.id}
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

      {filteredInstructions.length === 0 && (
        <div className="admin-instructions__empty">
          <p>Инструкции не найдены</p>
        </div>
      )}

      {selectedInstruction && (
        <div ref={detailsRef} className="admin-instructions__details">
          <h2>Просмотр шага инструкции</h2>
          <p>
            <strong>Инструмент:</strong>{" "}
            {instruments.find(
              (inst) => inst.id === selectedInstruction.instrumentId,
            )?.name || "-"}
          </p>
          <p>
            <strong>Название:</strong> {selectedInstruction.title}
          </p>
          <p>
            <strong>Шаг:</strong> {selectedInstruction.stepNumber}
          </p>
          <p>
            <strong>Описание:</strong>
          </p>
          <div className="admin-instructions__content">
            {selectedInstruction.content}
          </div>
          {selectedInstruction.imageUrl && (
            <div className="admin-instructions__image-preview">
              <strong>Фото шага</strong>
              <img
                src={selectedInstruction.imageUrl}
                alt="Шаг инструкции"
                className="admin-instructions__image"
              />
            </div>
          )}
          {selectedInstruction.videoUrl && (
            <div className="admin-instructions__video-wrapper">
              <strong>Видео шага</strong>
              <video
                src={selectedInstruction.videoUrl}
                controls
                className="admin-instructions__video"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminInstructions;
