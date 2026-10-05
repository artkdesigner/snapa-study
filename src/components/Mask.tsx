import { useRef } from 'react'
import { MASK_LEAD_SCREENS, useMaskSlides } from '../lib/useMaskSlides'
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
  Детали корпуса: наезжает поверх прилипшего Slider (z-30). 3 полноэкранных
  слайда лежат стопкой в Mask-pin (в Figma —
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

function Mask() {
  const rootRef = useRef<HTMLElement>(null)
  useMaskSlides(rootRef)

  return (
    // Высота — по экрану на слайд + запас до первой смены: столько прокрутки
    // Mask-pin стоит прилипшим (src/lib/useMaskSlides.ts).
    <section
      ref={rootRef}
      aria-label="Design details"
      style={{ height: `${(SLIDES.length + MASK_LEAD_SCREENS) * 100}svh` }}
      className="Mask relative z-30 bg-bg-primary text-primary"
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
      </div>
    </section>
  )
}

export default Mask
