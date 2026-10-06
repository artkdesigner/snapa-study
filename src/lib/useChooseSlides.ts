import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flowTop } from './flowTop'

gsap.registerPlugin(ScrollTrigger)

// Экранов прокрутки до первой смены: первый слайд прилип и стоит.
export const CHOOSE_LEAD_SCREENS = 0.5
// Сколько стоит открывшийся слайд после своей смены (слайды 2…N).
export const CHOOSE_HOLD_SCREENS = 0.25
// Поворот шкалы (Choose-circle-wrap) за одну смену, по часовой.
const DIAL_STEP_DEG = 90

// Экранов прокрутки, пока Choose-pin прилип: запас + (смена + стоянка) на
// каждый слайд после первого. Высота секции в Choose.tsx = экран + это.
export const chooseScrollScreens = (count: number) =>
  CHOOSE_LEAD_SCREENS + (count - 1) * (1 + CHOOSE_HOLD_SCREENS)

// Шаг стопки значений в окне: расстояние между верхами соседних строк
// (высота строки + gap) — разный на брейкпоинтах, поэтому меряется.
const stepOf = (track: HTMLElement) => {
  const [first, second] = track.children as HTMLCollectionOf<HTMLElement>
  return second ? second.offsetTop - first.offsetTop : 0
}

/*
  Смена слайдов угловой маской: секция высотой в N экранов + запас, внутри
  прилипает (sticky) Choose-pin. Каждый слайд, кроме последнего, по очереди
  уходит за маску: .Choose-group (полуплоскость, обрезает слайд)
  поворачивается от 0° до 180° по часовой и открывает под собой следующий
  слайд. Ось — центр правого края экрана на Desktop (граница маски проходит
  снизу через лево наверх) и центр нижнего края на Mobile/Tablet (слева
  через верх направо); точка поворота задана классами origin-* в Choose.tsx,
  поэтому при смене брейкпоинта переключается сама. Сам .Choose-slide
  внутри поворачивается на столько же обратно — картинка стоит на месте.
  Одновременно со сменой: шкала поворачивается на DIAL_STEP_DEG по часовой,
  а в окнах счётчика и названия стопка значений уезжает вверх на одну
  строку (текущее уходит под край окна, следующее встаёт на его место).
  Тайминг как у Mask: CHOOSE_LEAD_SCREENS экранов стоит первый слайд, потом
  на каждую смену — экран прокрутки и CHOOSE_HOLD_SCREENS стоянки; всё
  привязано к скроллу (scrub, линейно — плавность даёт Lenis), назад
  откатывается само.
*/
export function useChooseSlides(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const groups = gsap.utils.toArray<HTMLElement>('.Choose-group', root)
    const slides = gsap.utils.toArray<HTMLElement>('.Choose-slide', root)
    const pin = root.querySelector<HTMLElement>('.Choose-pin')
    const dial = root.querySelector<HTMLElement>('.Choose-circle-wrap')
    const tracks = gsap.utils.toArray<HTMLElement>('[data-choose-track]', root)
    if (!pin || !dial || groups.length < 2) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { duration: 1, ease: 'none' },
        scrollTrigger: {
          start: () => flowTop(root),
          end: () => flowTop(root) + root.offsetHeight - pin.offsetHeight,
          scrub: true,
          // шаг строк в окнах меряется заново при ресайзе (смена брейкпоинта)
          invalidateOnRefresh: true,
        },
      })
      // последний слайд не уходит — он остаётся на экране
      groups.slice(0, -1).forEach((group, i) => {
        const at = CHOOSE_LEAD_SCREENS + i * (1 + CHOOSE_HOLD_SCREENS)
        tl.to(group, { rotation: 180 }, at)
          .to(slides[i], { rotation: -180 }, at)
          .to(dial, { rotation: DIAL_STEP_DEG * (i + 1) }, at)
        tracks.forEach((track) =>
          tl.to(track, { y: () => -stepOf(track) * (i + 1) }, at),
        )
      })
      // пустой хвост — стоянка последнего слайда (единицы таймлайна = экраны)
      tl.set({}, {}, chooseScrollScreens(groups.length))
    }, root)

    return () => ctx.revert()
  }, [rootRef])
}
