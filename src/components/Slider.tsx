import { useRef } from 'react'
import { useScrollSlides } from '../lib/useScrollSlides'
import slide1 from '../assets/slider-1.webp'
import slide2 from '../assets/slider-2.webp'
import slide3 from '../assets/slider-3.webp'
import slide4 from '../assets/slider-4.webp'
import slide2Full from '../assets/slider-2-full.webp'
import slide3Full from '../assets/slider-3-full.webp'
import slide4Full from '../assets/slider-4-full.webp'

/*
  Характеристики: 4 слайда — картинка + пункт списка. Текущая картинка стоит
  в рамке, остальные ждут под ней (сдвинуты на 100% вниз, обрезаны рамкой);
  текущий пункт списка яркий, остальные — 40%. Стартовое состояние — первый
  слайд; смена по скроллу с пином — src/lib/useScrollSlides.ts.
  Mobile/Tablet: картинка сверху занимает всё свободное место, список снизу.
  Desktop: две равные колонки, список прижат к низу правой.
  Картинки: на Desktop у слайдов 2–4 свой кадр из Figma (вырезан из
  исходника — `image`), на Mobile/Tablet — исходник целиком (`imageFull`),
  везде object-cover по центру.
*/
const SLIDES = [
  {
    title: '4-Lens Optical System',
    image: slide1,
    alt: 'Close-up of the Snapa zoom lens',
  },
  {
    title: 'Sonar Autofocus',
    image: slide2,
    imageFull: slide2Full,
    alt: 'Snapa lens barrel with its focus ring',
  },
  {
    title: 'Powerful Integrated Flash',
    image: slide3,
    imageFull: slide3Full,
    alt: 'Snapa flash window in warm side light',
  },
  {
    title: 'Large-Format Instant Printing',
    image: slide4,
    imageFull: slide4Full,
    alt: 'Back of the Snapa camera resting on rocks',
  },
]

function Slider() {
  const rootRef = useRef<HTMLElement>(null)
  useScrollSlides(rootRef)

  return (
    // Высота — по экрану на слайд: столько прокрутки уходит на смену слайдов,
    // пока Slider-pin прилип к верху (src/lib/useScrollSlides.ts).
    <section
      ref={rootRef}
      aria-labelledby="slider-title"
      style={{ height: `${SLIDES.length * 100}svh` }}
      className="Slider relative z-20 bg-bg-primary text-accent"
    >
      <div className="Slider-pin sticky top-0 flex h-svh flex-col gap-2.5 p-2.5 md:gap-5 md:p-5 lg:flex-row lg:gap-7.5 lg:p-7.5">
        {/* min-h — страховка на очень низких экранах, в пропорциях макета не
            срабатывает (там картинка ≈ 63% высоты) */}
        <div className="Slider-img-wrap relative min-h-[50svh] flex-1 overflow-clip lg:min-h-0">
          {SLIDES.map((slide, i) => (
            <picture key={slide.title}>
              {slide.imageFull && (
                <source media="(min-width: 62rem)" srcSet={slide.image} />
              )}
              <img
                src={slide.imageFull ?? slide.image}
                alt={slide.alt}
                aria-hidden={i !== 0}
                loading="lazy"
                draggable={false}
                className={`Slider-img absolute inset-0 block size-full object-cover ${i === 0 ? '' : '[transform:translateY(100%)]'}`}
              />
            </picture>
          ))}
        </div>

        <div className="Slider-right flex flex-col gap-2.5 lg:flex-1 lg:justify-end lg:gap-3.75">
          <h2
            id="slider-title"
            className="Slider-title text-lead-sm text-accent/40 lg:text-lead-lg"
          >
            Characteristics
          </h2>
          <ol className="Slider-list">
            {SLIDES.map((slide, i) => (
              <li
                key={slide.title}
                aria-current={i === 0 ? 'true' : undefined}
                // 40% → hover 75% → активный (aria-current) 100%; переход как
                // у Button — 300ms Figma Ease out
                className="Slider-list-item border-b border-accent text-heading-sm opacity-40 transition-opacity duration-300 ease-[cubic-bezier(0,0,0.58,1)] not-aria-[current=true]:hover:opacity-75 aria-[current=true]:opacity-100 md:text-heading-md lg:text-heading-lg"
              >
                {/* клик — перелистнуть на этот слайд (useScrollSlides) */}
                <button
                  type="button"
                  className="Slider-list-button flex w-full cursor-pointer items-center gap-10 py-5 text-left md:items-start lg:py-10"
                >
                  <span className="Slider-list-number shrink-0">
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  <span className="Slider-list-title min-w-0 flex-1">
                    {slide.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default Slider
