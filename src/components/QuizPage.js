import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import {
  getQuizDetails,
  getUserQuizResults,
  saveQuizResult,
} from "../services/quizService";
import { useAuth } from "../context/AuthContext";
import "./QuizPage.css";

const DIFFICULTY_LABELS = {
  0: "Легко",
  1: "Средне",
  2: "Сложно",
};

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [previousResult, setPreviousResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await getQuizDetails(id);
      setQuiz(data);

      // Проверяем, проходил ли пользователь эту викторину
      if (currentUser?.userId) {
        try {
          const results = await getUserQuizResults(currentUser.userId);
          const quizResult = results.quizResults?.find((r) => r.quizId === id);
          if (quizResult) {
            setAlreadyTaken(true);
            setPreviousResult(quizResult);
          }
        } catch (err) {
          // Если нет результатов, викторина не пройдена
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const question = quiz.questions[currentQuestion];
    const isCorrect =
      selectedAnswer &&
      selectedAnswer.toLowerCase() === question.correctAnswer.toLowerCase();

    setAnswers([
      ...answers,
      {
        questionId: question.id,
        selectedAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
      },
    ]);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Все вопросы отвечены, показываем результат
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const score = answers.reduce((sum, a) => sum + a.points, 0);
    const correctAnswers = answers.filter((a) => a.isCorrect).length;

    if (currentUser?.userId && !alreadyTaken) {
      setSubmitting(true);
      try {
        await saveQuizResult({
          quizId: id,
          userId: currentUser.userId,
          score,
          totalQuestions: quiz.questions.length,
          correctAnswers,
          maxScore: quiz.maxScore,
        });
      } catch (err) {
        console.error("Ошибка сохранения результата:", err);
      } finally {
        setSubmitting(false);
      }
    }

    setShowResult(true);
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-page__container">
          <div className="quiz-loading">Загрузка викторины...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page">
        <div className="quiz-page__container">
          <div className="quiz-error">Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-page">
        <div className="quiz-page__container">
          <div className="quiz-error">Викторина не найдена</div>
        </div>
      </div>
    );
  }

  // Если викторина уже пройдена
  if (alreadyTaken && previousResult) {
    return (
      <div className="quiz-page">
        <div className="quiz-page__container">
          <button
            className="quiz-page__back"
            onClick={() => navigate("/quizzes")}
          >
            <ArrowLeftIcon className="quiz-page__back-icon" />К викторинам
          </button>

          <div className="quiz-already-taken">
            <TrophyIcon className="quiz-already-taken__icon" />
            <h2 className="quiz-already-taken__title">Викторина пройдена</h2>
            <p className="quiz-already-taken__score">
              {previousResult.score} / {previousResult.maxScore} баллов
            </p>
            <p style={{ color: "var(--gray-light)" }}>
              Вы уже проходили эту викторину. Попробуйте другую!
            </p>
            <button
              className="btn btn--primary"
              style={{ marginTop: 20 }}
              onClick={() => navigate("/quizzes")}
            >
              К другим викторинам
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Показываем результат
  if (showResult) {
    const score = answers.reduce((sum, a) => sum + a.points, 0);
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const percentage = Math.round((score / quiz.maxScore) * 100);

    return (
      <div className="quiz-page">
        <div className="quiz-page__container">
          <button
            className="quiz-page__back"
            onClick={() => navigate("/quizzes")}
          >
            <ArrowLeftIcon className="quiz-page__back-icon" />К викторинам
          </button>

          <div className="quiz-result">
            <TrophyIcon className="quiz-result__icon" />
            <h2 className="quiz-result__title">Викторина завершена!</h2>
            <p className="quiz-result__score">
              {score} / {quiz.maxScore} баллов
            </p>
            <p className="quiz-result__details">
              {percentage >= 70
                ? "Отличный результат!"
                : percentage >= 40
                  ? "Хороший результат!"
                  : "Попробуйте ещё раз!"}
            </p>

            <div className="quiz-result__stats">
              <div className="quiz-result__stat">
                <div className="quiz-result__stat-value">{correctAnswers}</div>
                <div className="quiz-result__stat-label">Правильных</div>
              </div>
              <div className="quiz-result__stat">
                <div className="quiz-result__stat-value">
                  {quiz.questions.length - correctAnswers}
                </div>
                <div className="quiz-result__stat-label">Ошибок</div>
              </div>
              <div className="quiz-result__stat">
                <div className="quiz-result__stat-value">{percentage}%</div>
                <div className="quiz-result__stat-label">Процент</div>
              </div>
            </div>

            <button
              className="btn btn--primary"
              onClick={() => navigate("/quizzes")}
            >
              К другим викторинам
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-page">
      <div className="quiz-page__container">
        <button
          className="quiz-page__back"
          onClick={() => navigate("/quizzes")}
        >
          <ArrowLeftIcon className="quiz-page__back-icon" />К викторинам
        </button>

        <div className="quiz-page__header">
          <h1 className="quiz-page__title">{quiz.title}</h1>
          <p className="quiz-page__description">
            Вопрос {currentQuestion + 1} из {quiz.questions.length} •{" "}
            {DIFFICULTY_LABELS[quiz.difficulty]}
          </p>
        </div>

        <div className="quiz-progress">
          <div className="quiz-progress__bar">
            <div
              className="quiz-progress__fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="quiz-progress__text">
            {Math.round(progress)}% завершено
          </p>
        </div>

        <div className="quiz-question">
          <p className="quiz-question__number">Вопрос {currentQuestion + 1}</p>
          <h3 className="quiz-question__text">{question.questionText}</h3>

          <div className="quiz-options">
            {[
              { letter: "a", text: question.optionA },
              { letter: "b", text: question.optionB },
              ...(question.optionC
                ? [{ letter: "c", text: question.optionC }]
                : []),
              ...(question.optionD
                ? [{ letter: "d", text: question.optionD }]
                : []),
            ].map((option) => (
              <div
                key={option.letter}
                className={`quiz-option ${
                  selectedAnswer === option.letter
                    ? "quiz-option--selected"
                    : ""
                }`}
                onClick={() => handleAnswerSelect(option.letter)}
              >
                <span className="quiz-option__letter">
                  {option.letter.toUpperCase()}
                </span>
                <span className="quiz-option__text">{option.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="quiz-actions">
          <button
            className="btn btn--primary"
            disabled={selectedAnswer === null || submitting}
            onClick={handleNextQuestion}
          >
            {currentQuestion < quiz.questions.length - 1
              ? "Следующий вопрос"
              : "Завершить викторину"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
