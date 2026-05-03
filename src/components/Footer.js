import { MusicalNoteIcon } from "@heroicons/react/24/outline";
import "./Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer__container">
      <div className="footer__top">
        <div className="footer__brand">
          <div className="footer__logo">
            <MusicalNoteIcon className="navbar__logo-icon" />
            <span className="navbar__logo-text">
              Мастерская
              <span className="navbar__logo-accent"> Инструментов</span>
            </span>
          </div>
          <p className="footer__brand-desc">
            Сообщество мастеров, создающих музыкальные инструменты своими
            руками.
          </p>
        </div>
        <div className="footer__links-group">
          <h4>Каталог</h4>
          <ul>
            <li>
              <a href="#catalog">Струнные</a>
            </li>
            <li>
              <a href="#catalog">Ударные</a>
            </li>
            <li>
              <a href="#catalog">Духовые</a>
            </li>
          </ul>
        </div>
        <div className="footer__links-group">
          <h4>Сервисы</h4>
          <ul>
            <li>
              <a href="#calculator">Калькулятор</a>
            </li>
            <li>
              <a href="#quiz">Викторина</a>
            </li>
            <li>
              <a href="#blog">Блог</a>
            </li>
          </ul>
        </div>
        <div className="footer__links-group">
          <h4>Аккаунт</h4>
          <ul>
            <li>
              <a href="#login">Войти</a>
            </li>
            <li>
              <a href="#register">Регистрация</a>
            </li>
            <li>
              <a href="#profile">Личный кабинет</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2026 Мастерская Инструментов. Все права защищены.</span>
        <div className="footer__socials">
          <a href="#vk" aria-label="ВКонтакте">
            ВК
          </a>
          <a href="#tg" aria-label="Telegram">
            TG
          </a>
          <a href="#yt" aria-label="YouTube">
            YT
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
