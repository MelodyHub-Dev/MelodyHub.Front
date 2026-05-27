import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  getAllQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizDetails,
} from "../services/quizService";
import {
  getQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from "../services/quizQuestionService";
import "./AdminQuizzes.css";

const DIFFICULTY = ["Легко", "Средне", "Сложно"];

const emptyQuizForm = {
  title: "",
  description: "",
  difficulty: 1,
  isActive: true,
};
const emptyQuestionForm = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "a",
  explanation: "",
  points: 10,
};

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState(emptyQuizForm);
  const [editingId, setEditingId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const questionDisabled = !editingId;

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getAllQuizzes();
      setQuizzes(data.quizzes || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizDetails = async (id) => {
    try {
      const data = await getQuizDetails(id);
      setFormData({
        title: data.title,
        description: data.description || "",
        difficulty: data.difficulty ?? 1,
        isActive: data.isActive ?? true,
      });
      setEditingId(id);
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateQuiz({ id: editingId, ...formData });
      } else {
        const newId = await createQuiz(formData);
        // after create, load quizzes and select created
        await loadQuizzes();
        await loadQuizDetails(newId);
        return;
      }
      await loadQuizzes();
    } catch (err) {
      setError(err.message || "Ошибка");
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm("Удалить викторину?")) return;
    try {
      await deleteQuiz(id);
      setFormData(emptyQuizForm);
      setEditingId(null);
      setQuestions([]);
      await loadQuizzes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "difficulty"
            ? Number(value)
            : value,
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    if (type === "number" || name === "points") {
      newValue = Number(value);
    }
    if (name === "correctAnswer") {
      newValue = String(value).toLowerCase();
    }
    setQuestionForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const addOrUpdateQuestion = async (e) => {
    e.preventDefault();
    if (!editingId) {
      setError("Сохраните или выберите викторину перед добавлением вопросов");
      return;
    }
    try {
      const payload = { quizId: editingId, ...questionForm };
      if (editingQuestionId) {
        await updateQuizQuestion({ id: editingQuestionId, ...payload });
      } else {
        await createQuizQuestion(payload);
      }
      // reload questions
      const qlist = await getQuizQuestions(editingId);
      setQuestions(qlist.quizQuestions || qlist || []);
      setQuestionForm(emptyQuestionForm);
      setEditingQuestionId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setQuestionForm({
      questionText: q.questionText || "",
      optionA: q.optionA || "",
      optionB: q.optionB || "",
      optionC: q.optionC || "",
      optionD: q.optionD || "",
      correctAnswer: (q.correctAnswer || "a").toLowerCase(),
      explanation: q.explanation || "",
      points: q.points || 10,
    });
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Удалить вопрос?")) return;
    try {
      await deleteQuizQuestion(id);
      const qlist = await getQuizQuestions(editingId);
      setQuestions(qlist.quizQuestions || qlist || []);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-quizzes">
      <div className="admin-quizzes__header">
        <Link to="/admin" className="admin-quizzes__back">
          <ArrowLeftIcon className="admin-quizzes__back-icon" />
          Назад
        </Link>
        <h1>Управление викторинами</h1>
        <span className="admin-quizzes__count">{quizzes.length} викторин</span>
      </div>

      {error && <div className="admin-quizzes__error">{error}</div>}

      <div className="admin-quizzes__top-row">
        <div className="admin-quizzes__left-column">
          <form className="admin-quizzes__form" onSubmit={handleQuizSubmit}>
            <div className="admin-quizzes__form-row">
              <label>Название</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleQuizChange}
              />
            </div>
            <div className="admin-quizzes__form-row">
              <label>Описание</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleQuizChange}
                rows={3}
              />
            </div>
            <div className="admin-quizzes__form-row">
              <label>Сложность</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleQuizChange}
              >
                {DIFFICULTY.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-quizzes__form-row">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleQuizChange}
                />{" "}
                Активна
              </label>
            </div>

            <div className="admin-quizzes__form-row">
              <button
                type="submit"
                className="btn btn--primary admin-quizzes__submit"
              >
                {editingId ? "Сохранить викторину" : "Создать викторину"}
              </button>
            </div>
          </form>

          <div className="admin-quizzes__questions">
            <h3>Вопросы</h3>
            <form
              className={`admin-quizzes__question-form ${questionDisabled ? "disabled" : ""}`}
              onSubmit={addOrUpdateQuestion}
            >
              <input
                name="questionText"
                placeholder="Текст вопроса"
                value={questionForm.questionText}
                onChange={handleQuestionChange}
                disabled={questionDisabled}
              />
              <input
                name="optionA"
                placeholder="Вариант A"
                value={questionForm.optionA}
                onChange={handleQuestionChange}
                disabled={questionDisabled}
              />
              <input
                name="optionB"
                placeholder="Вариант B"
                value={questionForm.optionB}
                onChange={handleQuestionChange}
                disabled={questionDisabled}
              />
              <input
                name="optionC"
                placeholder="Вариант C (необязательно)"
                value={questionForm.optionC}
                onChange={handleQuestionChange}
                disabled={questionDisabled}
              />
              <input
                name="optionD"
                placeholder="Вариант D (необязательно)"
                value={questionForm.optionD}
                onChange={handleQuestionChange}
                disabled={questionDisabled}
              />
              <div className="admin-quizzes__question-meta">
                <label>
                  Правильный ответ
                  <select
                    name="correctAnswer"
                    value={questionForm.correctAnswer}
                    onChange={handleQuestionChange}
                    disabled={questionDisabled}
                  >
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                  </select>
                </label>
                <label>
                  Баллы
                  <input
                    type="number"
                    name="points"
                    value={questionForm.points}
                    onChange={handleQuestionChange}
                    min="0"
                    disabled={questionDisabled}
                  />
                </label>
              </div>
              <textarea
                name="explanation"
                placeholder="Объяснение (необязательно)"
                value={questionForm.explanation}
                onChange={handleQuestionChange}
                rows={2}
                disabled={questionDisabled}
              />
              <div className="admin-quizzes__list-actions">
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={questionDisabled}
                >
                  {editingQuestionId ? "Сохранить вопрос" : "Добавить вопрос"}
                </button>
                {editingQuestionId && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setEditingQuestionId(null);
                      setQuestionForm(emptyQuestionForm);
                    }}
                    disabled={questionDisabled}
                  >
                    Отмена
                  </button>
                )}
              </div>
              {questionDisabled && (
                <div className="admin-quizzes__note">
                  Сохраните или выберите викторину, чтобы добавлять вопросы
                </div>
              )}
            </form>

            <div className="admin-quizzes__questions-list">
              <table>
                <thead>
                  <tr>
                    <th>Вопрос</th>
                    <th>Баллы</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id}>
                      <td>{q.questionText}</td>
                      <td>{q.points}</td>
                      <td>
                        <button
                          className="btn btn--sm"
                          onClick={() => handleEditQuestion(q)}
                        >
                          <PencilIcon className="btn__icon" />
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => handleDeleteQuestion(q.id)}
                        >
                          <TrashIcon className="btn__icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="admin-quizzes__right-column">
          <h3>Список викторин</h3>
          <div className="admin-quizzes__list">
            {loading ? (
              <div>Загрузка...</div>
            ) : (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="admin-quizzes__list-item">
                  <div>
                    <div className="admin-quizzes__list-title">
                      {quiz.title}
                    </div>
                    <div className="admin-quizzes__list-meta">
                      {DIFFICULTY[quiz.difficulty] || "—"}
                    </div>
                  </div>
                  <div className="admin-quizzes__list-actions">
                    <button
                      className="btn btn--sm"
                      onClick={() => loadQuizDetails(quiz.id)}
                    >
                      <PencilIcon className="btn__icon" />
                    </button>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      <TrashIcon className="btn__icon" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuizzes;
