import circles from '../assets/choose-circles.svg'
import choose1 from '../assets/choose-1-1024.webp'
import choose2Sm from '../assets/choose-2-1280.webp'
import choose2Lg from '../assets/choose-2-1984.webp'
import choose3Sm from '../assets/choose-3-1280.webp'
import choose3Lg from '../assets/choose-3-2048.webp'
import choose4Sm from '../assets/choose-4-1920.webp'
import choose4Lg from '../assets/choose-4-2912.webp'

/*
  Выбор расцветки: 4 полноэкранных фото стопкой в Choose-pin (в Figma — слои
  Choose-img, сверху Choose-img.current; первый слайд сверху, остальные под
  ним по порядку), поверх — заголовок и Choose-decoration: счётчик со
  стрелками (Choose-controls), название расцветки (Choose-slider-title-wrap)
  и шкала из трёх пунктирных кругов (Choose-circle-wrap). Пока статика —
  виден первый слайд, смена слайдов будет отдельно.
  Счётчик и название — окна (overflow-clip) на высоту одной строки, в
  которых стопкой стоят все значения; видно текущее (первое).
  Desktop: заголовок слева, декор — колонка 473px справа, шкала уходит за
  правый край, название повёрнуто на 90°, затемнение — градиент справа.
  Mobile/Tablet: заголовок и декор (280px) внизу колонкой, шкала по центру,
  счётчик вертикальный — тот же блок, что на Desktop, повёрнутый на 90° и
  уменьшенный в 0.7137 раза (так в Figma, отсюда дробные размеры), цифры не
  повёрнуты. На Mobile заголовок в Figma прозрачный (opacity 0).
  Шкала — SVG по замерам из Figma (число и ширина рисок у каждого круга).
  У всех трёх кругов риска стоит ровно на 3 часах (начало круга в SVG), а
  золотые полоски счётчика по длине и отступам совпадают с толщиной колец —
  поэтому шкала повёрнута так, чтобы эта риска легла под полоски: на
  Desktop — на 9 часов (180°), на Mobile/Tablet — на 12 часов (−90°).
  Картинки: object-cover по центру; кадры разных пропорций, поэтому sizes —
  ширина отрисованного кадра: max(ширина экрана, высота × пропорции файла).
*/
const SLIDES = [
  {
    id: 'powder-light',
    title: 'Powder Light',
    images: [[choose1, 1024]],
    ratio: 1,
    alt: 'Teenage padel player reaching for the ball with his racket',
  },
  {
    id: 'honey-haze',
    title: 'Honey Haze',
    images: [
      [choose2Sm, 1280],
      [choose2Lg, 1984],
    ],
    ratio: 1984 / 2400,
    alt: 'Videographer with a camera rig in warm backlight',
  },
  {
    id: 'midnight-bloom',
    title: 'Midnight Bloom',
    images: [
      [choose3Sm, 1280],
      [choose3Lg, 2048],
    ],
    ratio: 1,
    alt: 'Motorcyclist leaning into a bend on a mountain road',
  },
  {
    id: 'moon-dust',
    title: 'Moon Dust',
    images: [
      [choose4Sm, 1920],
      [choose4Lg, 2912],
    ],
    ratio: 2912 / 1632,
    alt: 'Freckled woman among red poppies',
  },
] as const

// Стрелка счётчика: треугольник в квадрате 16×16, как Choose-poligon в Figma
// (не по центру квадрата — поворот вокруг центра квадрата, как в макете).
function Arrow({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className}>
      <path
        transform="translate(1.8016 1)"
        fill="currentColor"
        d="M5.33162 0.5C5.71652 -0.166667 6.67877 -0.166666 7.06367 0.5L12.2598 9.5C12.6447 10.1667 12.1636 11 11.3938 11H1.00149C0.231691 11 -0.249434 10.1667 0.135467 9.5L5.33162 0.5Z"
      />
    </svg>
  )
}

function Choose() {
  return (
    <section
      aria-labelledby="choose-title"
      className="Choose relative bg-bg-primary text-primary"
    >
      <div className="Choose-pin relative isolate flex h-svh flex-col items-center justify-end gap-15 overflow-clip lg:flex-row lg:justify-between lg:gap-0">
        <div className="Choose-title-wrap relative z-3 flex shrink-0 opacity-0 md:opacity-100 lg:pl-7.5">
          <h2
            id="choose-title"
            className="Choose-title text-poster-md whitespace-nowrap lg:text-poster-lg"
          >
            Choose
          </h2>
        </div>

        <div className="Choose-decoration relative isolate z-2 h-[17.5rem] w-full shrink-0 lg:flex lg:h-full lg:w-[29.5625rem] lg:items-center lg:justify-between lg:pr-7.5">
          <div
            aria-hidden="true"
            className="Choose-controls absolute top-0 left-1/2 z-3 flex -translate-x-1/2 flex-col items-center lg:static lg:translate-x-0 lg:flex-row"
          >
            <div className="Choose-controls-number-wrap flex h-[1.25rem] shrink-0 flex-col items-center overflow-clip rounded-[0.0892rem] text-body-md lg:h-[1.625rem] lg:w-[1.5rem] lg:gap-2.5 lg:rounded-[0.125rem] lg:text-body-lg">
              {SLIDES.map((slide, i) => (
                <span
                  key={slide.id}
                  className="Choose-controls-number shrink-0"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              ))}
            </div>
            <Arrow className="Choose-poligon-1 mt-[0.6231rem] size-[0.7137rem] shrink-0 rotate-180 lg:mt-0 lg:ml-[1.125rem] lg:size-[1rem] lg:rotate-90" />
            <span className="Choose-line-1 mt-[0.6694rem] h-[2.6763rem] w-[0.1784rem] shrink-0 bg-gold lg:mt-0 lg:ml-[0.9375rem] lg:h-[0.25rem] lg:w-[3.75rem]" />
            <span className="Choose-line-2 mt-[0.8919rem] h-[0.2676rem] w-[0.0892rem] shrink-0 bg-gold lg:mt-0 lg:ml-[1.25rem] lg:h-[0.125rem] lg:w-[0.375rem]" />
            <Arrow className="Choose-poligon-2 mt-[0.7137rem] size-[0.7137rem] shrink-0 lg:mt-0 lg:ml-[1rem] lg:size-[1rem] lg:-rotate-90" />
            <span className="Choose-line-3 mt-[0.5356rem] h-[1.3381rem] w-[0.0892rem] shrink-0 bg-gold lg:mt-0 lg:ml-[0.75rem] lg:h-[0.125rem] lg:w-[1.875rem]" />
          </div>

          {/* Desktop: коробка 48×288, в ней окно названия, повёрнутое на 90° */}
          <div className="Choose-slider-title-box absolute bottom-[1.25rem] left-1/2 z-3 -translate-x-1/2 md:bottom-[1.875rem] lg:static lg:flex lg:h-[18rem] lg:w-[3rem] lg:translate-x-0 lg:items-center lg:justify-center">
            <ul className="Choose-slider-title-wrap flex h-[2.25rem] shrink-0 flex-col items-center gap-2.5 overflow-clip rounded-full text-center text-heading-md whitespace-nowrap md:h-[2rem] lg:h-[3rem] lg:rotate-90 lg:text-heading-lg">
              {SLIDES.map((slide) => (
                <li key={slide.id} className="Choose-slider-title shrink-0">
                  {slide.title}
                </li>
              ))}
            </ul>
          </div>

          <img
            src={circles}
            alt=""
            draggable={false}
            className="Choose-circle-wrap pointer-events-none absolute top-[3.25rem] left-1/2 z-2 block size-[45.5rem] max-w-none -translate-x-1/2 -rotate-90 lg:top-1/2 lg:right-[-38.75rem] lg:left-auto lg:size-[63.75rem] lg:translate-x-0 lg:-translate-y-1/2 lg:rotate-180"
          />

          <div
            aria-hidden="true"
            className="Choose-overlay pointer-events-none absolute inset-0 z-1 bg-linear-to-b from-black/0 to-black/50 lg:bg-linear-to-r"
          />
        </div>

        <div className="Choose-img-wrap pointer-events-none absolute inset-0 z-1">
          {SLIDES.map((slide, i) => (
            <img
              key={slide.id}
              src={slide.images[slide.images.length - 1][0]}
              srcSet={slide.images.map(([src, w]) => `${src} ${w}w`).join(', ')}
              sizes={`max(100vw, ${Math.round(slide.ratio * 10000) / 100}vh)`}
              alt={slide.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
              // первый слайд сверху стопки, как Choose-img.current в Figma
              style={{ zIndex: SLIDES.length - i }}
              className="Choose-img absolute inset-0 block size-full max-w-none object-cover"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Choose
