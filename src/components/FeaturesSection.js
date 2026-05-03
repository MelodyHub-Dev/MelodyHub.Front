import {
  ListBulletIcon,
  CalculatorIcon,
  FolderOpenIcon,
  HeartIcon,
  PencilSquareIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import "./FeaturesSection.css";

const features = [
  {
    Icon: ListBulletIcon,
    title: "Пошаговые инструкции",
    desc: "Детальные руководства с фотографиями, чертежами и видеоматериалами для каждого инструмента.",
  },
  {
    Icon: CalculatorIcon,
    title: "Калькулятор стоимости",
    desc: "Автоматический расчёт затрат на материалы с учётом вашего региона и поставщиков.",
  },
  {
    Icon: FolderOpenIcon,
    title: "Управление проектами",
    desc: "Создавайте проекты, отслеживайте прогресс и ведите список необходимых материалов.",
  },
  {
    Icon: HeartIcon,
    title: "Избранное",
    desc: "Сохраняйте понравившиеся инструкции и материалы для быстрого доступа.",
  },
  {
    Icon: PencilSquareIcon,
    title: "Блог и статьи",
    desc: "Экспертные статьи о техниках работы с деревом, металлом и другими материалами.",
  },
  {
    Icon: TrophyIcon,
    title: "Викторина",
    desc: "Проверяйте знания о музыкальных инструментах и соревнуйтесь с другими мастерами.",
  },
];

const FeaturesSection = () => (
  <section className="features" id="instructions">
    <div className="features__container">
      <div className="features__header">
        <div className="section-label">Возможности</div>
        <h2 className="section-title">Всё для создания инструмента</h2>
        <p className="section-sub">
          Полный набор инструментов для мастера — от идеи до готового изделия
        </p>
      </div>
      <div className="features__grid">
        {features.map(({ Icon, title, desc }, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-card__icon">
              <Icon className="feature-card__svg" />
            </div>
            <h3 className="feature-card__title">{title}</h3>
            <p className="feature-card__desc">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
