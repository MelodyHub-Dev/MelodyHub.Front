import React, { useState, useEffect } from "react";
import { getInstrumentMaterials } from "../services/catalogService";
import { formatPrice } from "../services/catalogService";
import "./Calculator.css";

const Calculator = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState(new Set());
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
    return `${material.instrumentId}-${material.materialName}`;
  };

  const toggleMaterial = (material) => {
    const key = getMaterialKey(material);
    setSelectedMaterials((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filteredMaterials = materials.filter((material) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      material.materialName?.toLowerCase().includes(searchLower) ||
      material.instrumentName?.toLowerCase().includes(searchLower)
    );
  });

  const selectedMaterialsList = materials.filter((m) =>
    selectedMaterials.has(getMaterialKey(m)),
  );

  const totalPrice = selectedMaterialsList.reduce(
    (total, m) => total + m.totalCost,
    0,
  );

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
              const isSelected = selectedMaterials.has(
                getMaterialKey(material),
              );
              return (
                <div
                  key={getMaterialKey(material)}
                  className={`material-card ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleMaterial(material)}
                >
                  <div className="material-info">
                    <h3 className="material-name">{material.materialName}</h3>
                    <p className="material-instrument">
                      Для: {material.instrumentName}
                    </p>
                    <p className="material-quantity">
                      Количество: {material.quantity} {material.unitText}
                    </p>
                    <p className="material-unit-price">
                      Цена: {material.materialUnitPrice}
                    </p>
                  </div>
                  <div className="material-total">
                    <span className="total-cost">
                      {formatPrice(material.totalCost)}
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
            Выбрано материалов: {selectedMaterialsList.length}
          </div>
          {selectedMaterialsList.length > 0 && (
            <div className="selected-list">
              <h3>Выбранные материалы</h3>
              <ul>
                {selectedMaterialsList.map((m) => (
                  <li key={getMaterialKey(m)}>
                    {m.materialName} — {formatPrice(m.totalCost)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
