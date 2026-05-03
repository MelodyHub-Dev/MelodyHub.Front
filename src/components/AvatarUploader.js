import { useRef, useState } from "react";
import { CameraIcon } from "@heroicons/react/24/outline";
import "./AvatarUploader.css";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Компонент выбора аватарки.
 *
 * Props:
 *  - preview: string | null  — текущий URL аватарки (или null)
 *  - initials: string        — буквы для заглушки
 *  - onChange: (file) => void — вызывается при выборе нового файла
 *  - size: "md" | "lg"       — размер (по умолчанию "md")
 */
const AvatarUploader = ({ preview, initials = "?", onChange, size = "md" }) => {
  const [localPreview, setLocalPreview] = useState(preview || null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Допустимые форматы: JPEG, PNG, WebP, GIF");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Максимальный размер — 5 МБ");
      return;
    }
    setError("");
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    onChange?.(file);
  };

  const handleInputChange = (e) => handleFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className={`avatar-uploader avatar-uploader--${size}`}>
      <div
        className="avatar-uploader__circle"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Загрузить аватарку"
      >
        {localPreview ? (
          <img
            src={localPreview}
            alt="Аватарка"
            className="avatar-uploader__img"
          />
        ) : (
          <span className="avatar-uploader__initials">{initials}</span>
        )}
        <div className="avatar-uploader__overlay">
          <CameraIcon className="avatar-uploader__camera-icon" />
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="avatar-uploader__input"
        onChange={handleInputChange}
        aria-label="Выбрать файл аватарки"
      />

      {error && <p className="avatar-uploader__error">{error}</p>}
    </div>
  );
};

export default AvatarUploader;
