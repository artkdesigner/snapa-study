import { Fragment, useRef } from 'react'
import { scrollToSection } from '../lib/scrollToSection'
import FooterClock from './FooterClock'
import { useCoverZoom } from '../lib/useCoverZoom'
import { useFooterReveal } from '../lib/useFooterReveal'
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
  Наезжает на прилипший Steps (z выше, Steps затемняется). Когда наехал на
  70%, по очереди появляются слоган (побуквенно), меню, логотип, текст,
  соцсети, почта, адрес (src/lib/useFooterReveal.ts); линии над меню,
  логотипом и текстом растут по ширине. Линия — отдельный span поверх
  прозрачной верхней рамки (рамка держит место в раскладке, как в Figma).
  Слоган — кнопка, открывает попап заказа (как и Order в меню). Каждое слово — маска (обрезка только по
  вертикали, продлена вниз под хвост «y»), буквы в ней — inline-block,
  выезжают снизу.
  Ссылки Footer-link-big (меню) и Footer-link-small (соцсети, почта): Hover
  в Figma — opacity 70%; переход как у Button (Ease out 300ms) —
  длительность из Figma не читается.
*/
// Пункты меню ведут к секциям (scrollToSection); Order — кнопка, открывает
// попап заказа.
const MENU = [
  { name: 'Camera', section: 'slider' },
  { name: 'Prints', section: 'bigprint' },
  { name: 'Presets', section: 'mask' },
  { name: 'Mobile App', section: 'steps' },
]
const LINK_BIG =
  'Footer-link-big block cursor-pointer transition-opacity duration-300 ease-[cubic-bezier(0,0,0.58,1)] hover:opacity-70'
// Главные страницы соцсетей (своих аккаунтов у Snapa нет); открываются в
// новой вкладке.
const SOCIAL = [
  { name: 'Instagram', href: 'https://www.instagram.com/' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/' },
]
const TITLE_WORDS = ['Make', 'Moments', 'Physical']

type FooterProps = {
  // слоган и Order в меню — открывают попап заказа
  onOrder?: () => void
}

function Footer({ onOrder }: FooterProps) {
  const rootRef = useRef<HTMLElement>(null)
  useFooterReveal(rootRef)
  // Пока наезжает на Steps — фото фона уменьшается 110% → 100%.
  useCoverZoom(rootRef)

  return (
    // role: футер стоит внутри <main> (стопка наездов), без него он не
    // был бы ориентиром «contentinfo»
    <footer
      ref={rootRef}
      role="contentinfo"
      className="Footer relative z-60 flex min-h-svh flex-col items-center justify-between gap-15 px-2.5 pt-20 pb-5 text-primary md:px-5 md:pt-25 lg:px-7.5 lg:pt-40 lg:pb-7.5"
    >
      <div aria-hidden className="Footer-bg absolute inset-0 overflow-clip">
        <picture>
          <source media="(min-width: 62rem)" srcSet={bgDesktop} />
          <img
            src={bgMobile}
            alt=""
            loading="lazy"
            draggable={false}
            data-cover-zoom
            className="block size-full object-cover lg:object-bottom"
          />
        </picture>
        <div className="absolute inset-0 bg-linear-to-b from-accent/0 from-50% to-accent/20" />
      </div>

      {/* Кнопка: открывает попап заказа. Hover — как у Button:
          70%, Ease out 300ms. GSAP двигает только буквы внутри, opacity
          самой кнопки не трогает. */}
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={onOrder}
        className="Footer-title relative cursor-pointer text-center text-slogan-sm transition-opacity duration-300 ease-[cubic-bezier(0,0,0.58,1)] hover:opacity-70 md:text-slogan-md lg:text-slogan-lg"
      >
        <span className="sr-only">{TITLE_WORDS.join(' ')}</span>
        {/* обрезка по высоте заглавных — на блоке внутри: на самой кнопке
            text-box не действует */}
        <span className="trim-cap block">
          {TITLE_WORDS.map((word, i) => (
            <Fragment key={word}>
              {i > 0 && ' '}
              {/* перенос после «Make» — на Mobile и Tablet */}
              {i === 1 && <br className="lg:hidden" />}
              <span
                aria-hidden="true"
                className="Footer-title-word -mb-[0.2em] inline-block pb-[0.2em] [overflow:visible_clip]"
              >
                {Array.from(word).map((char, j) => (
                  <span key={j} data-letter className="inline-block">
                    {char}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </span>
      </button>

      <div className="Footer-content relative flex w-full flex-col gap-6 text-body md:gap-10 lg:grid lg:grid-cols-3 lg:gap-x-2.5 lg:gap-y-15">
        <div className="Footer-logo-wrap relative border-t border-transparent pt-6 md:pt-10 lg:col-start-2 lg:row-start-1 lg:self-start lg:pt-2.5">
          <span
            aria-hidden="true"
            className="Footer-logo-line absolute inset-x-0 -top-px h-px origin-left bg-primary"
          />
          <img
            src={logo}
            alt="Snapa"
            draggable={false}
            className="Footer-logo block h-auto w-[1.9375rem] md:h-[1.9375rem] md:w-[2.5625rem]"
          />
        </div>

        <nav
          aria-label="Menu"
          className="Footer-Menu relative flex flex-col gap-2.5 lg:col-start-1 lg:row-start-1 lg:border-t lg:border-transparent lg:pt-2.5"
        >
          <span
            aria-hidden="true"
            className="Footer-menu-line absolute inset-x-0 -top-px h-px origin-left bg-primary hidden lg:block"
          />
          {/* подпись есть только на Desktop */}
          <p
            aria-hidden="true"
            className="Footer-menu-title hidden text-primary/40 lg:block"
          >
            Menu
          </p>
          <ul className="Footer-menu-nav flex flex-col items-start text-heading-sm md:text-heading-md lg:text-heading-lg">
            {/* Hover в Figma — opacity 70% (как Footer-link-small). Появление
                анимирует текст внутри: инлайн-opacity от GSAP на самой
                ссылке перебила бы hover. */}
            {MENU.map(({ name, section }) => (
              <li key={name}>
                <a
                  href={`#${section}`}
                  onClick={(event) => {
                    event.preventDefault()
                    scrollToSection(section)
                  }}
                  className={LINK_BIG}
                >
                  <span className="Footer-link-big-text block">{name}</span>
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={onOrder}
                className={LINK_BIG}
              >
                <span className="Footer-link-big-text block">Order</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="Footer-text-wrap relative pt-5 md:pt-15 lg:col-start-3 lg:row-start-1 lg:self-start lg:border-t lg:border-transparent lg:pt-2.5 lg:whitespace-nowrap">
          <span
            aria-hidden="true"
            className="Footer-text-line absolute inset-x-0 -top-px h-px origin-left bg-primary hidden lg:block"
          />
          <p className="Footer-text">
            More space, more detail, <br className="lg:hidden" />
            and more meaning in every <br className="hidden lg:inline" />
            photograph you print.
          </p>
        </div>

        <div className="Footer-social-wrap flex flex-col gap-2.5 pt-5 md:pt-15 lg:col-start-1 lg:row-start-2 lg:self-start lg:pt-0">
          <p className="Footer-social-title text-primary/40">Social media</p>
          <ul className="Footer-social-links flex flex-col items-start gap-1 md:flex-row md:gap-2.5">
            {SOCIAL.map(({ name, href }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="Footer-link-small block transition-opacity duration-300 ease-[cubic-bezier(0,0,0.58,1)] hover:opacity-70"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="Footer-email-wrap flex flex-col items-start gap-2.5 pt-2.5 md:pt-0 lg:col-start-2 lg:row-start-2 lg:self-start">
          <p className="Footer-email-title text-primary/40">
            Keen to work with us?
          </p>
          <a
            href="mailto:hello@snapa.io"
            className="Footer-link-small block transition-opacity duration-300 ease-[cubic-bezier(0,0,0.58,1)] hover:opacity-70"
          >
            hello@snapa.io
          </a>
        </div>

        <div className="Footer-location flex flex-col gap-2.5 pt-2.5 md:pt-0 lg:col-start-3 lg:row-start-2 lg:self-start">
          <p className="Footer-location-title text-primary/40">
            Location x Time
          </p>
          {/* Desktop — в строку */}
          <address className="Footer-location-list flex flex-col gap-0.5 not-italic lg:flex-row lg:gap-2.5">
            <FooterClock className="Footer-time" />
            <span className="Footer-adress">807 S Los Angeles St</span>
          </address>
        </div>
      </div>
    </footer>
  )
}

export default Footer
