import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flowTop } from './flowTop'

gsap.registerPlugin(ScrollTrigger)

// Экранов прокрутки до первой смены: первый слайд прилип и стоит.
export const MASK_LEAD_SCREENS = 0.5
// Сколько стоит открывшийся слайд после своей смены (слайды 2…N): до
// следующей смены, у последнего — до наезда следующей секции.
export const MASK_HOLD_SCREENS = 0.25

// Экранов прокрутки, пока Mask-pin прилип: запас + (смена + стоянка) на
// каждый слайд после первого. Высота секции в Mask.tsx = экран + это.
export const maskScrollScreens = (count: number) =>
  MASK_LEAD_SCREENS + (count - 1) * (1 + MASK_HOLD_SCREENS)

/*
  Смена слайдов маской: секция высотой в N экранов + запас, внутри прилипает
  (sticky) Mask-pin. Пока он прилип, каждый слайд, кроме последнего, по
  очереди уходит за маску: .Mask-group (маска, обрезает слайд) поворачивается
  вокруг нижнего левого угла экрана от 0° до −90°, открывая под собой
  следующий слайд. Сам .Mask-slide внутри поворачивается на столько же в
  обратную сторону — картинка и текст стоят на месте, движется только
  граница маски. Сначала MASK_LEAD_SCREENS экранов первый слайд просто стоит,
  потом на каждую смену — экран прокрутки и MASK_HOLD_SCREENS стоянки
  открывшегося слайда; угол привязан к скроллу
  (scrub, линейно — плавность даёт Lenis), назад откатывается сам.
  Ожидаются .Mask-group с .Mask-slide внутри, по одной паре на слайд.
*/
export function useMaskSlides(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const groups = gsap.utils.toArray<HTMLElement>('.Mask-group', root)
    const slides = gsap.utils.toArray<HTMLElement>('.Mask-slide', root)
    const pin = root.querySelector<HTMLElement>('.Mask-pin')
    if (!pin || groups.length < 2) return

    const ctx = gsap.context(() => {
      // Ось поворота — нижний левый угол (у маски и слайда он совпадает).
      gsap.set([...groups, ...slides], { transformOrigin: '0% 100%' })

      const tl = gsap.timeline({
        defaults: { duration: 1, ease: 'none' },
        scrollTrigger: {
          // по потоку: секция прилипает в конце (sticky), прилипший rect врёт
          start: () => flowTop(root),
          end: () => flowTop(root) + root.offsetHeight - pin.offsetHeight,
          scrub: true,
        },
      })
      // последний слайд не уходит — он остаётся на экране; смены начинаются
      // после запаса (пустое начало таймлайна — тоже часть скраба)
      groups.slice(0, -1).forEach((group, i) => {
        const at = MASK_LEAD_SCREENS + i * (1 + MASK_HOLD_SCREENS)
        tl.to(group, { rotation: -90 }, at).to(slides[i], { rotation: 90 }, at)
      })
      // пустой хвост — стоянка последнего слайда (единицы таймлайна = экраны)
      tl.set({}, {}, maskScrollScreens(groups.length))
    }, root)

    return () => ctx.revert()
  }, [rootRef])
}
