import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flowTop } from './flowTop'

gsap.registerPlugin(ScrollTrigger)

// Тайминги — в макете не заданы, подобраны; крутить здесь.
const DURATION = 0.5 // на один элемент
const EASE = 'power2.out'
const DISTANCE_REM = 1.5 // slide-up снизу
// Шаг между стартами соседних элементов, с.
const STEP = 0.1
// Точка запуска: верх секции дошёл до 30% высоты экрана — секция видна на
// 70% экрана.
const START_VIEWPORT = 0.3

/*
  Элементы [data-reveal-item] внутри секции по очереди появляются (opacity +
  slide-up): каждый следующий стартует через STEP после старта предыдущего.
  [data-reveal-line] внутри элемента одновременно с ним растёт по ширине от 0
  до 100% (scaleX от левого края).
  При скролле назад выше точки запуска все сразу и одновременно уходят
  обратно; смена направления на ходу подхватывает их с текущего места.
*/
export function useScrollItemsReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const items = gsap.utils.toArray<HTMLElement>('[data-reveal-item]', root)
    if (!items.length) return

    // rem → px на момент анимации (корень масштабируется от ширины экрана)
    const distance = () =>
      parseFloat(getComputedStyle(document.documentElement).fontSize) *
      DISTANCE_REM
    const hidden = () => ({ autoAlpha: 0, y: distance() })
    const lines = items.map((item) =>
      item.querySelector<HTMLElement>('[data-reveal-line]'),
    )
    const tween = { duration: DURATION, ease: EASE, overwrite: true }
    let tl: gsap.core.Timeline | null = null

    // Сначала пустой контекст, потом ctx.add — колбэки ScrollTrigger могут
    // сработать прямо при создании (см. useScrollSlides).
    const ctx = gsap.context(() => {}, root)

    const show = () =>
      ctx.add(() => {
        tl?.kill()
        tl = gsap.timeline()
        items.forEach((item, i) => {
          tl!.to(item, { ...tween, autoAlpha: 1, y: 0 }, i * STEP)
          const line = lines[i]
          if (line) tl!.to(line, { ...tween, scaleX: 1 }, i * STEP)
        })
      })
    const hide = () =>
      ctx.add(() => {
        tl?.kill()
        tl = null
        gsap.to(items, { ...tween, ...hidden() })
        gsap.to(lines.filter(Boolean), { ...tween, scaleX: 0 })
      })

    ctx.add(() => {
      gsap.set(items, hidden())
      gsap.set(lines.filter(Boolean), { scaleX: 0 })
      ScrollTrigger.create({
        // по потоку — секция может прилипать (sticky), см. flowTop
        start: () => flowTop(root) - window.innerHeight * START_VIEWPORT,
        onEnter: show,
        onLeaveBack: hide,
      })
    })

    return () => ctx.revert()
  }, [rootRef])
}
