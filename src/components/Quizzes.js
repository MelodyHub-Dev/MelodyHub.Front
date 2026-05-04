import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { getAllQuizzes } from "../services/quizService";
import "./Quizzes.css";

const DIFFICULTY_LABELS = {
  0: "Легко",
  1: "Средне",
  2: "Сложно",
};

const DIFFICULTY_CLASS = {
  0: "quiz-card__difficulty--easy",
  1: "quiz-card__difficulty--medium",
  2: "quiz-card__difficulty--hard",
};

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getAllQuizzes();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="quizzes-page">
        <div className="quizzes-page__container">
          <div className="quizzes-loading">Загрузка викторин...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quizzes-page">
        <div className="quizzes-page__container">
          <div className="quizzes-error">Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="quizzes-page">
      <div className="quizzes-page__container">
        <div className="quizzes-page__header">
          <h1>Викторины</h1>
          <p>Проверьте свои знания о музыкальных инструментах</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="quizzes-empty">
            <ClipboardDocumentListIcon />
            <p>Викторин пока нет</p>
          </div>
        ) : (
          <div className="quizzes-grid">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="quiz-card"
                onClick={() => navigate(`/quiz/${quiz.id}`)}
              >
                <div className="quiz-card__header">
                  <h3 className="quiz-card__title">{quiz.title}</h3>
                  <span
                    className={`quiz-card__difficulty ${DIFFICULTY_CLASS[quiz.difficulty]}`}
                  >
                    {DIFFICULTY_LABELS[quiz.difficulty]}
                  </span>
                </div>

                {quiz.description && (
                  <p className="quiz-card__description">{quiz.description}</p>
                )}

                <div className="quiz-card__stats">
                  <span className="quiz-card__stat">
                    <QuestionMarkCircleIcon />
                    {quiz.questionCount} вопросов
                  </span>
                  <span className="quiz-card__stat">
                    <ClockIcon />
                    {quiz.maxScore} баллов
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
