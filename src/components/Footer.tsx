import logo from '../assets/logo.svg'
import bgDesktop from '../assets/footer-desktop.webp'
import bgMobile from '../assets/footer-mobile.webp'

/*
  Футер на весь экран: слоган сверху по центру, внизу — меню и контакты.
  Фон — фото камеры (Desktop и Mobile/Tablet — разные кадры) с градиентом
  акцентного цвета к низу (0 → 20% от середины).
  Mobile/Tablet: колонка — логотип под линией, меню, текст, соцсети, почта,
  адрес. Desktop: сетка 3 колонки × 2 ряда — в первом ряду под общей линией
  меню (с подписью «Menu»), логотип, текст; во втором — соцсети, почта, адрес.
  Порядок в DOM — мобильный, на Desktop ячейки расставлены явно.
*/
const MENU = ['Camera', 'Prints', 'Presets', 'Mobile App', 'Contact']
const SOCIAL = ['Instagram', 'LinkedIn']

function Footer() {
  return (
    <footer className="Footer relative flex min-h-svh flex-col items-center justify-between gap-15 px-2.5 pt-20 pb-5 text-primary md:px-5 md:pt-25 lg:px-7.5 lg:pt-40 lg:pb-7.5">
      <div aria-hidden className="Footer-bg absolute inset-0">
        <picture>
          <source media="(min-width: 62rem)" srcSet={bgDesktop} />
          <img
            src={bgMobile}
            alt=""
            loading="lazy"
            draggable={false}
            className="block size-full object-cover lg:object-bottom"
          />
        </picture>
        <div className="absolute inset-0 bg-linear-to-b from-accent/0 from-50% to-accent/20" />
      </div>

      <p className="Footer-title trim-cap relative w-full text-center text-slogan-sm md:text-slogan-md lg:text-slogan-lg">
        Make <br className="lg:hidden" />
        Moments Physical
      </p>

      <div className="Footer-content relative flex w-full flex-col gap-6 text-body md:gap-10 lg:grid lg:grid-cols-3 lg:gap-x-2.5 lg:gap-y-15">
        <div className="Footer-logo-wrap border-t border-primary pt-6 md:pt-10 lg:col-start-2 lg:row-start-1 lg:self-start lg:pt-2.5">
          <img
            src={logo}
            alt="Snapa"
            draggable={false}
            className="block h-auto w-[1.9375rem] md:h-[1.9375rem] md:w-[2.5625rem]"
          />
        </div>

        <nav
          aria-labelledby="footer-menu-title"
          className="Footer-Menu flex flex-col gap-2.5 lg:col-start-1 lg:row-start-1 lg:border-t lg:border-primary lg:pt-2.5"
        >
          <p
            id="footer-menu-title"
            className="Footer-menu-title sr-only text-primary/40 lg:not-sr-only"
          >
            Menu
          </p>
          <ul className="Footer-menu-nav flex flex-col items-start text-heading-sm md:text-heading-md lg:text-heading-lg">
            {MENU.map((item) => (
              <li key={item}>
                {/* Куда ведут пункты — пока не задано (placeholder-ссылки) */}
                <a className="Footer-link-big block">{item}</a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="Footer-text-wrap pt-5 md:pt-15 lg:col-start-3 lg:row-start-1 lg:self-start lg:border-t lg:border-primary lg:pt-2.5 lg:whitespace-nowrap">
          More space, more detail, <br className="lg:hidden" />
          and more meaning in every <br className="hidden lg:inline" />
          photograph you print.
        </p>

        <div className="Footer-social-wrap flex flex-col gap-2.5 pt-5 md:pt-15 lg:col-start-1 lg:row-start-2 lg:self-start lg:pt-0">
          <p className="Footer-social-title text-primary/40">Social media</p>
          <ul className="Footer-social-links flex flex-col items-start gap-1 md:flex-row md:gap-2.5">
            {SOCIAL.map((item) => (
              <li key={item}>
                <a className="Footer-link-small block">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="Footer-email-wrap flex flex-col items-start gap-2.5 pt-2.5 md:pt-0 lg:col-start-2 lg:row-start-2 lg:self-start">
          <p className="Footer-email-title text-primary/40">
            Keen to work with us?
          </p>
          <a href="mailto:hello@snapa.io" className="Footer-link-small block">
            hello@snapa.io
          </a>
        </div>

        <div className="Footer-location flex flex-col gap-2.5 pt-2.5 md:pt-0 lg:col-start-3 lg:row-start-2 lg:self-start">
          <p className="Footer-location-title text-primary/40">
            Location x Time
          </p>
          <address className="Footer-location-list flex flex-col gap-0.5 not-italic">
            <span className="Footer-time">09:49:47 AM</span>
            <span className="Footer-adress">807 S Los Angeles St</span>
          </address>
        </div>
      </div>
    </footer>
  )
}

export default Footer
