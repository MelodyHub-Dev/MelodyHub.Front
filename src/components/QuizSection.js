import { useState } from "react";
import {
  TrophyIcon,
  CheckCircleIcon,
  BookOpenIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import "./QuizSection.css";

const questions = [
  {
    question: "Сколько струн у классической гитары?",
    options: ["4", "5", "6", "7"],
    correct: 2,
  },
  {
    question: "Из какого дерева традиционно делают деку скрипки?",
    options: ["Дуб", "  Ель", "Берёза", "Сосна"],
    correct: 1,
  },
  {
    question: "Как называется мастер по изготовлению смычковых инструментов?",
    options: ["Столяр", "Лютьер", "Плотник", "Токарь"],
    correct: 1,
  },
];

const QuizSection = () => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  const q = questions[current];

  return (
    <section className="quiz" id="quiz">
      <div className="quiz__container">
        <div className="quiz__header">
          <div className="section-label">Викторина</div>
          <h2 className="section-title">Проверь свои знания</h2>
          <p className="section-sub">
            Ответь на вопросы о музыкальных инструментах и узнай свой уровень
          </p>
        </div>

        <div className="quiz__card">
          {!finished ? (
            <>
              <div className="quiz__progress">
                <div
                  className="quiz__progress-bar"
                  style={{ width: `${(current / questions.length) * 100}%` }}
                ></div>
              </div>
              <div className="quiz__counter">
                {current + 1} / {questions.length}
              </div>
              <h3 className="quiz__question">{q.question}</h3>
              <div className="quiz__options">
                {q.options.map((opt, idx) => {
                  let cls = "quiz__option";
                  if (selected !== null) {
                    if (idx === q.correct) cls += " quiz__option--correct";
                    else if (idx === selected) cls += " quiz__option--wrong";
                  }
                  return (
                    <button
                      key={idx}
                      className={cls}
                      onClick={() => handleAnswer(idx)}
                    >
                      <span className="quiz__option-letter">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt.trim()}
                    </button>
                  );
                })}
              </div>
              {selected !== null && (
                <button className="quiz__next" onClick={handleNext}>
                  {current + 1 < questions.length
                    ? "Следующий вопрос"
                    : "Завершить"}
                  <ArrowRightIcon className="quiz__next-icon" />
                </button>
              )}
            </>
          ) : (
            <div className="quiz__result">
              <div className="quiz__result-icon">
                {score === questions.length ? (
                  <TrophyIcon className="quiz__result-svg quiz__result-svg--gold" />
                ) : score >= 2 ? (
                  <CheckCircleIcon className="quiz__result-svg quiz__result-svg--green" />
                ) : (
                  <BookOpenIcon className="quiz__result-svg quiz__result-svg--gray" />
                )}
              </div>
              <h3 className="quiz__result-title">
                {score === questions.length
                  ? "Отлично!"
                  : score >= 2
                    ? "Хороший результат!"
                    : "Есть куда расти!"}
              </h3>
              <p className="quiz__result-score">
                Правильных ответов: <strong>{score}</strong> из{" "}
                {questions.length}
              </p>
              <div className="quiz__result-actions">
                <button className="quiz__next" onClick={handleReset}>
                  Пройти снова
                </button>
                <button className="btn btn--outline">Все викторины</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default QuizSection;
