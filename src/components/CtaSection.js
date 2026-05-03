import { ArrowRightIcon } from "@heroicons/react/24/outline";
import "./CtaSection.css";

const CtaSection = () => (
  <section className="cta">
    <div className="cta__container">
      <div className="cta__glow"></div>
      <div className="cta__content">
        <h2 className="cta__title">Готов создать свой первый инструмент?</h2>
        <p className="cta__sub">
          Зарегистрируйся и получи доступ к личному кабинету, калькулятору
          стоимости и полной библиотеке инструкций.
        </p>
        <div className="cta__actions">
          <button className="hero__btn hero__btn--primary">
            Создать аккаунт бесплатно
            <ArrowRightIcon className="hero__btn-arrow-icon" />
          </button>
          <button className="hero__btn hero__btn--secondary">
            Узнать больше
          </button>
        </div>
        <p className="cta__note">
          Регистрация бесплатна. Подтверждение по email.
        </p>
      </div>
    </div>
  </section>
);

export default CtaSection;
