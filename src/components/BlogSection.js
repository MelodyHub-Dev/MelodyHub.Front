import {
  CubeIcon,
  WrenchScrewdriverIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import "./BlogSection.css";

const posts = [
  {
    Icon: CubeIcon,
    tag: "Материалы",
    title: "Какое дерево выбрать для акустической гитары",
    desc: "Разбираем свойства ели, кедра, красного дерева и других пород для деки и обечаек.",
    date: "5 апр 2026",
    readTime: "7 мин",
  },
  {
    Icon: WrenchScrewdriverIcon,
    tag: "Техники",
    title: "Основы лютьерства: инструменты мастера",
    desc: "Полный список инструментов, которые понадобятся для создания первого струнного инструмента.",
    date: "1 апр 2026",
    readTime: "10 мин",
  },
  {
    Icon: MusicalNoteIcon,
    tag: "Акустика",
    title: "Как форма деки влияет на звук инструмента",
    desc: "Физика звука в деревянных инструментах: резонанс, тембр и роль конструктивных элементов.",
    date: "28 мар 2026",
    readTime: "12 мин",
  },
];

const BlogSection = () => (
  <section className="blog" id="blog">
    <div className="blog__container">
      <div className="blog__header">
        <div className="section-label">Блог</div>
        <h2 className="section-title">Статьи и советы мастеров</h2>
        <p className="section-sub">
          Экспертные материалы о создании инструментов и работе с материалами
        </p>
      </div>
      <div className="blog__grid">
        {posts.map(({ Icon, tag, title, desc, date, readTime }, i) => (
          <article className="blog-card" key={i}>
            <div className="blog-card__cover">
              <Icon className="blog-card__cover-icon" />
            </div>
            <div className="blog-card__body">
              <span className="blog-card__tag">{tag}</span>
              <h3 className="blog-card__title">{title}</h3>
              <p className="blog-card__desc">{desc}</p>
              <div className="blog-card__footer">
                <span className="blog-card__date">
                  <CalendarDaysIcon className="blog-card__meta-icon" /> {date}
                </span>
                <span className="blog-card__read">
                  <BookOpenIcon className="blog-card__meta-icon" /> {readTime}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="blog__more">
        <button className="btn btn--outline btn--lg">Все статьи</button>
      </div>
    </div>
  </section>
);

export default BlogSection;
