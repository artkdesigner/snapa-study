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
  Детали корпуса: 3 полноэкранных слайда лежат стопкой в Mask-pin (в Figma —
  слои Mask-slide друг на друге, сверху Mask-slide.current). Первый слайд —
  сверху, остальные под ним по порядку. Пока статика: виден первый; смена
  слайдов по скроллу будет отдельным шагом.
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
  return (
    <section
      aria-label="Design details"
      className="Mask relative bg-bg-primary text-primary"
    >
      <div className="Mask-pin relative h-svh overflow-clip">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            // первый слайд сверху стопки, как Mask-slide.current в Figma
            style={{ zIndex: SLIDES.length - i }}
            className="Mask-slide absolute inset-0 flex flex-col items-start gap-7.5 overflow-clip px-2.5 pt-5 md:px-5 md:pt-7.5 lg:px-7.5 lg:pt-15"
          >
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
        ))}
      </div>
    </section>
  )
}

export default Mask
