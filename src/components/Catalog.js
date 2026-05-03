import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Catalog.css";
import {
  getInstruments,
  getCategories,
  getInstrumentMaterials,
  getDifficultyText,
  calculateInstrumentCost,
  formatPrice,
} from "../services/catalogService";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../services/profileService";

const Catalog = () => {
  const [instruments, setInstruments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Фильтры
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    loadData();
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!currentUser?.userId) return;
    try {
      const data = await getFavorites(currentUser.userId);
      const favoriteIds = new Set(data.items?.map((f) => f.instrumentId) || []);
      setFavorites(favoriteIds);
    } catch (err) {
      console.error("Ошибка загрузки избранного:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser, loadFavorites]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [instrumentsData, categoriesData, materialsData] =
        await Promise.all([
          getInstruments(),
          getCategories(),
          getInstrumentMaterials(),
        ]);

      setInstruments(instrumentsData.instruments || []);
      setCategories(categoriesData.instrumentCategories || []);
      setMaterials(materialsData.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (instrumentId) => {
    if (!currentUser) {
      setError("Для добавления в избранное нужно авторизоваться");
      return;
    }

    const userId = currentUser.userId || currentUser.id;
    const isFavorite = favorites.has(instrumentId);

    try {
      if (isFavorite) {
        await removeFavorite(userId, instrumentId);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(instrumentId);
          return next;
        });
      } else {
        await addFavorite(userId, instrumentId);
        setFavorites((prev) => new Set(prev).add(instrumentId));
      }
    } catch (err) {
      // Если уже в избранном - просто обновляем состояние
      if (err.message.includes("already in favorites")) {
        setFavorites((prev) => new Set(prev).add(instrumentId));
        setError("");
      } else {
        setError(err.message);
      }
    }
  };

  // Фильтрация и сортировка
  const filteredInstruments = instruments
    .filter((instrument) => {
      const matchesSearch =
        instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (instrument.shortDescription &&
          instrument.shortDescription
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesCategory =
        !selectedCategory || instrument.categoryId === selectedCategory;

      const matchesDifficulty =
        !selectedDifficulty ||
        instrument.difficulty.toString() === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "difficulty":
          return a.difficulty - b.difficulty;
        case "views":
          return b.viewsCount - a.viewsCount;
        case "cost":
          const costA = calculateInstrumentCost(a.id, materials);
          const costB = calculateInstrumentCost(b.id, materials);
          return costA - costB;
        default:
          return 0;
      }
    });

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Без категории";
  };

  if (loading) {
    return (
      <div className="catalog-container">
        <div className="loading">Загрузка каталога...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-container">
        <div className="error">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>Каталог инструментов</h1>
        <p>Найдите идеальный инструмент для создания</p>
      </div>

      {/* Фильтры и поиск */}
      <div className="catalog-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск инструментов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-row">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="filter-select"
          >
            <option value="">Любая сложность</option>
            <option value="0">Начинающий</option>
            <option value="1">Средний</option>
            <option value="2">Эксперт</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="name">По названию</option>
            <option value="difficulty">По сложности</option>
            <option value="views">По популярности</option>
            <option value="cost">По стоимости</option>
          </select>
        </div>
      </div>

      {/* Результаты */}
      <div className="catalog-results">
        <div className="results-info">
          Найдено инструментов: {filteredInstruments.length}
        </div>

        <div className="instruments-grid">
          {filteredInstruments.map((instrument) => {
            const cost = calculateInstrumentCost(instrument.id, materials);
            const isFavorite = favorites.has(instrument.id);

            return (
              <div key={instrument.id} className="instrument-card">
                <div className="card-header">
                  <h3 className="instrument-name">{instrument.name}</h3>
                  <span className="category-badge">
                    {getCategoryName(instrument.categoryId)}
                  </span>
                </div>

                <div className="card-body">
                  {instrument.shortDescription && (
                    <p className="instrument-description">
                      {instrument.shortDescription}
                    </p>
                  )}

                  <div className="instrument-stats">
                    <div className="stat-item">
                      <span className="stat-label">Сложность:</span>
                      <span
                        className={`difficulty-badge difficulty-${instrument.difficulty}`}
                      >
                        {getDifficultyText(instrument.difficulty)}
                      </span>
                    </div>

                    {instrument.estimatedHours && (
                      <div className="stat-item">
                        <span className="stat-label">Время:</span>
                        <span className="stat-value">
                          {instrument.estimatedHours} ч
                        </span>
                      </div>
                    )}

                    <div className="stat-item">
                      <span className="stat-label">Стоимость материалов:</span>
                      <span className="cost-value">
                        {cost > 0 ? formatPrice(cost) : "Не указана"}
                      </span>
                    </div>

                    <div className="stat-item">
                      <span className="stat-label">Просмотры:</span>
                      <span className="stat-value">
                        {instrument.viewsCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="btn-details"
                    onClick={() => navigate(`/instrument/${instrument.id}`)}
                  >
                    Подробнее
                  </button>
                  <button
                    className={`btn-favorite ${isFavorite ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(instrument.id);
                    }}
                  >
                    {isFavorite ? "★ В избранном" : "♡ В избранное"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInstruments.length === 0 && (
          <div className="no-results">
            <p>Инструменты не найдены</p>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
