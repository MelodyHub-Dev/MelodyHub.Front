import React, { useState, useEffect } from "react";
import {
  getInstrumentMaterials,
  getMaterialUnitText,
  formatPrice,
} from "../services/catalogService";
import "./Calculator.css";

const Calculator = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await getInstrumentMaterials();
      setMaterials(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialKey = (material) => {
    return `${material.instrumentId}-${material.materialId}`;
  };

  const incrementMaterial = (material) => {
    const key = getMaterialKey(material);
    setSelectedMaterials((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  };

  const decrementMaterial = (material) => {
    const key = getMaterialKey(material);
    setSelectedMaterials((prev) => {
      const current = prev[key] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return {
        ...prev,
        [key]: current - 1,
      };
    });
  };

  const selectedMaterialsList = materials.filter((m) => {
    const key = getMaterialKey(m);
    return selectedMaterials[key] > 0;
  });

  const selectedCountTotal = Object.values(selectedMaterials).reduce(
    (total, count) => total + count,
    0,
  );

  const totalPrice = selectedMaterialsList.reduce((total, m) => {
    const key = getMaterialKey(m);
    const quantity = Number(m.quantity || 0);
    const unitPrice = Number(m.materialUnitPrice || 0);
    const lineCost = quantity * unitPrice;
    return total + (selectedMaterials[key] || 0) * lineCost;
  }, 0);

  const filteredMaterials = materials.filter((material) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      material.materialName?.toLowerCase().includes(searchLower) ||
      material.instrumentName?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="calculator-container">
        <div className="loading">Загрузка материалов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calculator-container">
        <div className="error">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h1>Калькулятор стоимости материалов</h1>
        <p>Выберите материалы для расчета общей стоимости</p>
      </div>
      <div className="search-box">
        <input
          type="text"
          placeholder="Поиск материалов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="calculator-content">
        <div className="materials-list">
          <div className="materials-grid">
            {filteredMaterials.map((material) => {
              const key = getMaterialKey(material);
              const selectedCount = selectedMaterials[key] || 0;
              const isSelected = selectedCount > 0;
              return (
                <div
                  key={key}
                  className={`material-card ${isSelected ? "selected" : ""}`}
                >
                  {material.materialImageUrl ? (
                    <div className="material-image-wrapper">
                      <img
                        src={material.materialImageUrl}
                        alt={material.materialName}
                        className="material-card__image"
                      />
                    </div>
                  ) : null}
                  <div className="material-info">
                    <h3 className="material-name">{material.materialName}</h3>
                    <p className="material-instrument">
                      Для: {material.instrumentName}
                    </p>
                    <p className="material-quantity">
                      Количество: {material.quantity}{" "}
                      {getMaterialUnitText(
                        material.materialUnit || material.unitText,
                      )}
                    </p>
                    <p className="material-unit-price">
                      Цена: {formatPrice(material.materialUnitPrice)}
                    </p>
                  </div>
                  <div className="material-actions">
                    <button
                      className="material-action-btn"
                      type="button"
                      onClick={() => decrementMaterial(material)}
                    >
                      −
                    </button>
                    <span className="material-action-count">
                      {selectedCount}
                    </span>
                    <button
                      className="material-action-btn"
                      type="button"
                      onClick={() => incrementMaterial(material)}
                    >
                      +
                    </button>
                  </div>
                  <div className="material-total">
                    <span className="total-cost">
                      {formatPrice(
                        selectedCount > 0
                          ? selectedCount *
                              Number(material.quantity || 0) *
                              Number(material.materialUnitPrice || 0)
                          : Number(material.quantity || 0) *
                              Number(material.materialUnitPrice || 0),
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="no-results">
              <p>Материалы не найдены</p>
              <p>Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </div>

        <div className="summary-panel">
          <h2>Итоговая сумма</h2>
          <div className="total-price">{formatPrice(totalPrice)}</div>
          <div className="selected-count">
            Выбрано единиц материалов: {selectedCountTotal}
          </div>
          {selectedMaterialsList.length > 0 && (
            <div className="selected-list">
              <h3>Выбранные материалы</h3>
              <ul>
                {selectedMaterialsList.map((m) => {
                  const key = getMaterialKey(m);
                  const count = selectedMaterials[key] || 0;
                  return (
                    <li key={key}>
                      <span>
                        {m.materialName} × {count}
                      </span>
                      <span>
                        {formatPrice(
                          count *
                            Number(m.quantity || 0) *
                            Number(m.materialUnitPrice || 0),
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
