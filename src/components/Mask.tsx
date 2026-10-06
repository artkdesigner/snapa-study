import { useRef } from 'react'
import { maskScrollScreens, useMaskSlides } from '../lib/useMaskSlides'
import { useCoverOverlay } from '../lib/useCoverOverlay'
import mask1Sm from '../assets/mask-1-1920.webp'
import mask1Md from '../assets/mask-1-2880.webp'
import mask1Lg from '../assets/mask-1-3840.webp'
import mask2Sm from '../assets/mask-2-1920.webp'
import mask2Md from '../assets/mask-2-2880.webp'
import mask2Lg from '../assets/mask-2-3840.webp'
import mask3Sm from '../assets/mask-3-1920.webp'
import mask3Md from '../assets/mask-3-2880.webp'
import mask3Lg from '../assets/mask-3-3840.webp'

/*
  Детали корпуса: наезжает поверх прилипшего Slider (z-30), в конце сама
  прилипает, и на неё наезжает BigPrint — Mask-overlay затемняет её
  (src/lib/useCoverOverlay.ts). 3 полноэкранных слайда лежат стопкой в Mask-pin (в Figma —
  слои Mask-slide друг на друге, сверху Mask-slide.current). Первый слайд —
  сверху, остальные под ним по порядку. Каждый слайд обёрнут в маску
  Mask-group: при скролле маска поворачивается вокруг нижнего левого угла и
  открывает следующий слайд (src/lib/useMaskSlides.ts). Маска — квадрат со
  стороной «ширина + высота экрана»: при любом угле поворота она накрывает
  всю часть экрана над своей нижней гранью. Размеры — в единицах контейнера
  (cqw/cqh) от Mask-pin.
  Заголовок слайда — поверх фото слева сверху; подпись под ним только на
  Desktop. Переносы строк в заголовках 1 и 3 — как в макете (отдельные
  строки), заголовок 2 переносится сам.
  Картинки: одинаковый кадр на всех брейкпоинтах, object-cover по центру.
  На портретных экранах кадр 16:9 упирается в высоту, поэтому в sizes —
  max(ширина экрана, высота × 16/9): браузер берёт файл под реальную ширину
  отрисованного кадра.
*/
const SLIDES = [
  {
    id: 'shutter',
    title: ['Physical Shutter', 'Button'],
    text: 'A mechanical shutter button with tactile feedback makes every shot feel deliberate.',
    // ширина подписи из макета — от неё зависят переносы
    textWidth: 'lg:w-[23.75rem]',
    images: [mask1Sm, mask1Md, mask1Lg],
    alt: 'Top plate of the Snapa camera with its shutter button and dials',
  },
  {
    id: 'base',
    title: ['Flat Base + Stability'],
    text: 'A flat base allows the camera to stand securely on tables, shelves, or other flat surfaces.',
    textWidth: 'lg:w-[21.75rem]',
    images: [mask2Sm, mask2Md, mask2Lg],
    alt: 'Snapa camera standing upright on a dark rock',
  },
  {
    id: 'thumb',
    title: ['Thumb Rest', 'Built In'],
    text: 'A discreet rear thumb rest improves stability and control during one-handed shooting.',
    textWidth: 'lg:w-[25rem]',
    images: [mask3Sm, mask3Md, mask3Lg],
    alt: 'Back of the Snapa camera with its thumb rest, resting between rocks',
  },
]

const WIDTHS = [1920, 2880, 3840]
const SECTION_SVH = (1 + maskScrollScreens(SLIDES.length)) * 100

function Mask() {
  const rootRef = useRef<HTMLElement>(null)
  useMaskSlides(rootRef)
  useCoverOverlay(rootRef)

  return (
    // Высота — экран + прокрутка под смены со стоянками (maskScrollScreens):
    // столько Mask-pin стоит прилипшим (src/lib/useMaskSlides.ts).
    // Сама секция тоже sticky, с top = экран минус её высота: прилипает на
    // последнем слайде и стоит, пока на неё наезжает BigPrint.
    <section
      ref={rootRef}
      id="mask"
      aria-label="Design details"
      style={{ height: `${SECTION_SVH}svh`, top: `${100 - SECTION_SVH}svh` }}
      className="Mask sticky z-30 bg-bg-primary text-primary"
    >
      <div className="Mask-pin sticky top-0 h-svh overflow-clip [container-type:size]">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            // первый слайд сверху стопки, как Mask-slide.current в Figma
            style={{ zIndex: SLIDES.length - i }}
            className="Mask-group absolute bottom-0 left-0 size-[calc(100cqw+100cqh)] overflow-clip"
          >
            <div className="Mask-slide absolute bottom-0 left-0 flex h-[100cqh] w-[100cqw] flex-col items-start gap-7.5 overflow-clip px-2.5 pt-5 md:px-5 md:pt-7.5 lg:px-7.5 lg:pt-15">
              <img
                src={slide.images[2]}
                srcSet={slide.images
                  .map((src, j) => `${src} ${WIDTHS[j]}w`)
                  .join(', ')}
                sizes="max(100vw, 177.78vh)"
                alt={slide.alt}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="Mask-slide-img absolute inset-0 block size-full max-w-none object-cover"
              />
              <h2 className="Mask-slide-title relative text-poster-sm md:text-poster-md lg:text-poster-lg">
                {slide.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
              <p
                className={`Mask-slide-text relative hidden lg:block lg:text-body-lg ${slide.textWidth}`}
              >
                {slide.text}
              </p>
            </div>
          </div>
        ))}

        {/* поверх стопки слайдов (у них z 1…N) — затемняет видимый экран */}
        <div
          aria-hidden="true"
          data-cover-overlay
          className="Mask-overlay pointer-events-none absolute inset-0 z-10 bg-dark opacity-0"
        />
      </div>
    </section>
  )
}

export default Mask
