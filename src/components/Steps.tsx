import { useRef, type ReactNode } from 'react'
import { useScrollLinesReveal } from '../lib/useScrollLinesReveal'
import { useScrollSteps } from '../lib/useScrollSteps'
import frame from '../assets/steps-phone-frame.webp'
import screenHome from '../assets/steps-screen-0.webp'
import screenPreview from '../assets/steps-screen-1.webp'
import screenShutter from '../assets/steps-screen-2.webp'
import screenAdjust from '../assets/steps-screen-3.webp'
import screenGallery from '../assets/steps-screen-4.webp'

/*
  Шаги работы с приложением: заголовок секции, по центру — телефон, внизу —
  номера шагов. Наезжает на прилипший Presets (z выше, Presets
  затемняется). Скролл с пином (src/lib/useScrollSteps.ts) по очереди
  показывает 4 шага: экран телефона, блок шага (заголовок + описание) и
  активный номер с подписью.
  Экраны телефона — своим слоем (isolate), их z-index стопки не выходят
  наружу: рамка (z-1) всегда поверх экрана.
  Mobile: колонка — заголовок, телефон, номера; блоков шагов нет (в макете
  скрыты). Tablet: заголовок сверху по центру, телефон по центру экрана
  чуть ниже середины, номера справа внизу, блок шага слева внизу.
  Desktop: заголовок слева по центру высоты, телефон в центре, номера внизу
  по центру; блоки шагов чередуются: нечётные справа, чётные слева (на месте
  заголовка), по центру высоты.
  У активного номера раскрывается подпись (на всех брейкпоинтах).
  Телефон: пропорции 340 × 700, экран и рамка — в % от него, радиус экрана
  — в cqw (Steps-phone — контейнер), поэтому одна разметка на всех размерах.
*/
const SCREENS = [
  { src: screenHome, alt: 'Snapa app home screen' },
  { src: screenPreview, alt: 'Live camera preview in the Snapa app' },
  { src: screenShutter, alt: 'Shutter timer in the Snapa app' },
  { src: screenAdjust, alt: 'Camera controls in the Snapa app' },
  { src: screenGallery, alt: 'Photo gallery in the Snapa app' },
]

// Переносы в описаниях — как в Figma (блоки шагов есть только с Tablet).
// Подписи номеров (label) на Mobile — в две строки, кроме первой, на Tablet
// — только четвёртая (по просьбе пользователя; в Figma все в одну строку).
const STEPS: { label: ReactNode; title: string; text: ReactNode }[] = [
  {
    label: 'Live Preview',
    title: 'Live preview on your phone',
    text: (
      <>
        See the exact composition and framing in real
        <br />
        time before taking the shot.
      </>
    ),
  },
  {
    label: (
      <>
        Remote <br className="md:hidden" />
        shutter release
      </>
    ),
    title: 'Remote shutter release',
    text: (
      <>
        Trigger the camera from your phone to shoot
        <br />
        hands-free and stay in the frame.
      </>
    ),
  },
  {
    label: (
      <>
        Pre-Shot <br className="md:hidden" />
        Adjustments
      </>
    ),
    title: 'Pre-Shot Adjustments',
    text: (
      <>
        Fine-tune light, brightness, and camera settings
        <br />
        in the app before capturing the image.
      </>
    ),
  },
  {
    label: (
      <>
        Print from your <br className="lg:hidden" />
        smartphone gallery
      </>
    ),
    title: 'Print from your smartphone gallery',
    text: (
      <>
        Send selected images from your phone to the camera and
        <br />
        print them instantly.
      </>
    ),
  },
]

// Состояний — вступление + шаги; смены на первых (состояний − 1) экранах,
// плюс запас на последнем шаге.
const HOLD_SVH = 50
const SECTION_SVH = STEPS.length * 100 + 100 + HOLD_SVH

function Steps() {
  const rootRef = useRef<HTMLElement>(null)
  useScrollSteps(rootRef)
  // Наехала на Presets на 70% — заголовок и за ним подзаголовок выезжают
  // построчно одной очередью; назад — всё разом уезжает под маски.
  useScrollLinesReveal(rootRef)

  return (
    <section
      ref={rootRef}
      aria-labelledby="steps-title"
      style={{ height: `${SECTION_SVH}svh` }}
      className="Steps relative z-50 bg-bg-primary text-accent"
    >
      <div className="Steps-pin sticky top-0 flex h-svh flex-col items-center justify-between overflow-clip">
        <div className="Steps-title-wrap flex flex-col items-center gap-5 px-2.5 pt-10 text-center md:px-0 md:pt-5 lg:absolute lg:inset-y-0 lg:left-7.5 lg:items-start lg:justify-center lg:gap-7.5 lg:pt-0 lg:text-left">
          {/* Mobile 48px без стиля в Figma (Title/88 там 34px), Tablet —
              как Desktop (Title/88/Desktop) */}
          <h2
            id="steps-title"
            data-reveal-lines
            className="Steps-title text-[3rem] leading-none tracking-[-0.07em] md:text-headline-lg lg:whitespace-nowrap"
          >
            Control <br className="hidden lg:inline" />
            the <br className="md:hidden" />
            Shoot <br className="hidden md:inline" />
            from your Phone
          </h2>
          <p
            data-reveal-lines
            className="Steps-sub w-[15.8125rem] text-lead-sm md:w-[21.75rem] md:text-lead-lg"
          >
            Snapa connects to a mobile app for iOS and Android, turning your
            smartphone into a remote viewfinder and control center.
          </p>
        </div>

        {/* Mobile: телефон занимает место между заголовком и номерами (на
            низких экранах сжимается). Tablet/Desktop: по центру экрана. */}
        <div className="Steps-phone-wrap flex min-h-0 w-full flex-1 items-center justify-center md:pointer-events-none md:absolute md:inset-0">
          <div className="Steps-phone @container relative aspect-[340/700] h-full max-h-[23.75rem] md:top-[2.375rem] md:h-[31.25rem] md:max-h-none lg:top-0 lg:h-[43.75rem]">
            <div className="Steps-phone-content absolute isolate inset-[1.4107%_3.8991%_1.6364%_3.9958%] overflow-clip rounded-[10.049cqw] bg-primary">
              {SCREENS.map((screen, i) => (
                <img
                  key={screen.src}
                  src={screen.src}
                  alt={screen.alt}
                  aria-hidden={i !== 0}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  // сверху — экран вступления, под ним шаги по порядку
                  style={{ zIndex: SCREENS.length - i }}
                  className="Steps-screen absolute inset-0 block size-full max-w-none object-cover"
                />
              ))}
            </div>
            <img
              src={frame}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="Steps-phone-frame pointer-events-none absolute z-1 top-[-1.1407%] left-[-1.4836%] block h-[102.032%] w-[102.749%] max-w-none"
            />
          </div>
        </div>

        <ol className="Steps-items pointer-events-none absolute inset-0 hidden md:block">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className={`Steps-item absolute bottom-0 left-0 flex w-[27.5rem] flex-col gap-6 border-t border-accent p-5 opacity-0 lg:top-0 lg:my-auto lg:h-fit lg:w-[33.75rem] lg:p-0 lg:pt-5 ${i % 2 === 0 ? 'lg:right-7.5 lg:left-auto' : 'lg:left-7.5'}`}
            >
              <h3
                className={`Steps-item-title text-title-lg ${i === STEPS.length - 1 ? 'w-full' : 'w-[24.3125rem]'}`}
              >
                {step.title}
              </h3>
              <p className="Steps-item-sub text-lead-lg">{step.text}</p>
            </li>
          ))}
        </ol>

        <ol className="Steps-list relative flex w-full items-center justify-center gap-5 p-5 md:w-auto md:self-end lg:mt-auto lg:gap-7.5 lg:self-center lg:p-7.5">
          {STEPS.map((step, i) => (
            // shrink-0: если список не влезет в ширину, он выйдет за поля, а
            // не сожмёт пункт (подпись схлопнулась бы до 0 — она свёрнута
            // колонкой 0fr и не держит ширину)
            <li key={step.title} className="Steps-list-item group shrink-0">
              {/* клик — прокрутить к этому шагу (useScrollSteps) */}
              <button
                type="button"
                // номер и подпись: Mobile/Tablet Body/16 14/1.3, Desktop 16/1.1;
                // цвет подписи — Accent 100% (наследуется от секции)
                // text-left: кнопка по умолчанию центрирует текст, а подписи
                // в две строки — по левому краю
                className="Steps-list-button flex cursor-pointer items-center text-left text-lead-sm lg:text-lead-lg"
              >
                <span className="Steps-list-number-wrap flex size-[2.125rem] shrink-0 items-center justify-center rounded-full border-[0.125rem] border-accent/40 text-accent/40 transition-colors duration-300 ease-[cubic-bezier(0,0,0.58,1)] group-aria-[current=step]:border-accent group-aria-[current=step]:text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Подпись свёрнута колонкой 0fr (остаётся именем кнопки
                    для скринридера), у активного — 1fr */}
                <span className="Steps-list-title grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-aria-[current=step]:grid-cols-[1fr] group-aria-[current=step]:opacity-100">
                  {/* отступ 8px от номера — внутри обрезки: padding на самой
                      ячейке не даёт свернуть её в 0, лишние 8px добавлялись
                      к gap между пунктами */}
                  <span className="min-w-0 overflow-hidden">
                    <span className="block pl-2 whitespace-nowrap">
                      {step.label}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default Steps
