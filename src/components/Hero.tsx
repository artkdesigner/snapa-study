import heroDesktop from '../assets/hero-desktop.webp'
import heroTablet from '../assets/hero-tablet.webp'
import heroMobile from '../assets/hero-mobile.webp'
import logo from '../assets/logo.svg'
import { useRef, type Ref } from 'react'
import Button from './Button'
import { WORDMARK_LETTERS, WORDMARK_LETTER_CLASS } from '../lib/wordmark'
import { useHeroReveal, type HeroReveal } from '../lib/useHeroReveal'
import { useCoverOverlay } from '../lib/useCoverOverlay'

/*
  Сетка вместо абсолютных координат из Figma:
  - Mobile/Tablet: шапка → свободное место (1fr) → Snapa → нижний блок.
  - Desktop: Snapa слева и шапка в правой колонке (726px) в первой строке,
    нижний блок на всю ширину в последней.
  Секция прилипает к верху экрана (sticky), следующая (Intro) наезжает на
  неё; Hero-overlay затемняет её по мере накрытия (src/lib/useCoverOverlay.ts).
*/
type HeroProps = {
  // h1 — цель, на которую прелоудер приводит вордмарк
  titleRef?: Ref<HTMLHeadingElement>
  reveal?: HeroReveal
}

function Hero({ titleRef, reveal = 'static' }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null)
  useHeroReveal(rootRef, reveal)
  useCoverOverlay(rootRef)

  return (
    <section
      ref={rootRef}
      className="Hero sticky top-0 isolate grid min-h-svh grid-rows-[auto_1fr_auto_auto] bg-dark px-2.5 pt-2.5 pb-5 text-primary md:px-5 md:pt-5 lg:grid-cols-[1fr_45.375rem] lg:grid-rows-[auto_1fr_auto] lg:p-7.5"
    >
      <picture className="Hero-bg absolute inset-0 -z-10">
        <source media="(min-width: 62rem)" srcSet={heroDesktop} />
        <source media="(min-width: 30.0625rem)" srcSet={heroTablet} />
        <img
          src={heroMobile}
          alt="Snapa instant camera resting on rocks in a beam of warm light"
          fetchPriority="high"
          draggable={false}
          className="block size-full object-cover"
        />
      </picture>

      <header className="Hero-top-right row-start-1 flex items-center justify-between lg:col-start-2 lg:self-start">
        <a
          href={import.meta.env.BASE_URL}
          className="Hero-logo block"
          draggable={false}
          aria-label="Snapa — home"
        >
          <img
            src={logo}
            alt=""
            draggable={false}
            className="block h-[1.9375rem] w-[2.5625rem]"
          />
        </a>
        <Button>Order</Button>
      </header>

      <h1
        ref={titleRef}
        className="Hero-snapa trim-cap row-start-3 text-display-sm whitespace-nowrap md:text-display-md lg:col-start-1 lg:row-start-1 lg:self-start lg:text-display-lg"
      >
        {WORDMARK_LETTERS.map((letter, i) => (
          <span key={i} className={WORDMARK_LETTER_CLASS}>
            {letter}
          </span>
        ))}
      </h1>

      <div className="Hero-bottom row-start-4 flex flex-col gap-10 pt-10 lg:col-span-2 lg:row-start-3 lg:flex-row-reverse lg:items-end lg:gap-7.5 lg:pt-0">
        <p
          data-reveal-lines
          className="Hero-title text-title-sm md:w-[26.25rem] md:text-title-md lg:w-[45.375rem] lg:shrink-0 lg:text-title-lg"
        >
          A modern instant camera with clean design, a high-quality display,
          large-format prints, creative presets
        </p>

        <div className="Hero-sub-wrap flex items-center gap-2.5 text-body text-primary/40 lg:flex-1 lg:items-start lg:gap-7.5 lg:text-primary/80">
          <div className="Hero-sub-left min-w-0 flex-1 lg:w-[21.75rem] lg:flex-none">
            <p data-reveal-lines className="lg:hidden">
              Instant Large Prints
              <br />
              with Rich Details
            </p>
            <p data-reveal-lines className="hidden lg:block">
              A New Standard
              <br />
              for Instant Photography
            </p>
          </div>
          <p
            data-reveal-lines
            className="Hero-sub-right min-w-0 flex-1 lg:w-[21.75rem] lg:flex-none"
          >
            Ergonomic Design Made
            <br />
            for Comfortable Shooting
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        data-cover-overlay
        className="Hero-overlay pointer-events-none absolute inset-0 bg-dark opacity-0"
      />
    </section>
  )
}

export default Hero
