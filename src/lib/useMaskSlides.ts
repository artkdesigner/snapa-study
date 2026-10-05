import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
  Смена слайдов маской: секция высотой в N экранов, внутри прилипает
  (sticky) Mask-pin. Пока он прилип, каждый слайд, кроме последнего, по
  очереди уходит за маску: .Mask-group (маска, обрезает слайд) поворачивается
  вокруг нижнего левого угла экрана от 0° до −90°, открывая под собой
  следующий слайд. Сам .Mask-slide внутри поворачивается на столько же в
  обратную сторону — картинка и текст стоят на месте, движется только
  граница маски. На каждую смену — экран прокрутки, угол привязан к скроллу
  (scrub, линейно — плавность даёт Lenis), назад откатывается сам.
  Ожидаются .Mask-group с .Mask-slide внутри, по одной паре на слайд.
*/
export function useMaskSlides(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const groups = gsap.utils.toArray<HTMLElement>('.Mask-group', root)
    const slides = gsap.utils.toArray<HTMLElement>('.Mask-slide', root)
    if (groups.length < 2) return

    const ctx = gsap.context(() => {
      // Ось поворота — нижний левый угол (у маски и слайда он совпадает).
      gsap.set([...groups, ...slides], { transformOrigin: '0% 100%' })

      const tl = gsap.timeline({
        defaults: { duration: 1, ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })
      // последний слайд не уходит — он остаётся на экране
      groups.slice(0, -1).forEach((group, i) => {
        tl.to(group, { rotation: -90 }, i).to(slides[i], { rotation: 90 }, i)
      })
    }, root)

    return () => ctx.revert()
  }, [rootRef])
}
