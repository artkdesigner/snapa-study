import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Тайминги — в макете не заданы, подобраны; крутить здесь.
const IMAGE_DURATION = 1
const IMAGE_EASE = 'expo.inOut'
const ITEM_DURATION = 0.6
const ITEM_EASE = 'power2.out'
const DIM_OPACITY = 0.4 // неактивный пункт списка (в Figma — 40%)

/*
  Секция высотой в N экранов, внутри прилипает (sticky) блок на экран.
  Прогресс прокрутки секции делится на N слайдов: слайд меняется на 0.5, 1.5,
  2.5… экранах прокрутки. Смена — анимацией по времени, не скрабом: старая
  картинка уезжает вверх, новая приезжает снизу (при скролле назад —
  наоборот), прежний пункт списка гаснет до 40%, новый становится ярким.
  Клик по .Slider-list-button перелистывает на слайд своего пункта.
  Ожидаются .Slider-img и .Slider-list-item внутри rootRef.
*/
export function useScrollSlides(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const images = gsap.utils.toArray<HTMLImageElement>('.Slider-img', root)
    const items = gsap.utils.toArray<HTMLElement>('.Slider-list-item', root)
    const count = images.length
    if (count < 2) return

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const imageTween = {
      duration: reduced ? 0 : IMAGE_DURATION,
      ease: IMAGE_EASE,
      overwrite: true,
    }
    let current = 0
    let scrollToSlide = (_index: number) => {}

    const goTo = (next: number) => {
      const prev = current
      current = next
      const dir = next > prev ? 1 : -1

      // Пропущенные при быстром скролле — сразу по своим сторонам.
      images.forEach((img, i) => {
        if (i === prev || i === next) return
        gsap.killTweensOf(img)
        gsap.set(img, { yPercent: i < next ? -100 : 100 })
      })
      gsap.to(images[prev], { ...imageTween, yPercent: -100 * dir })
      // Новая заходит со стороны движения; если она ещё в кадре (смена
      // направления посреди анимации) — продолжает с текущего места.
      const nextY = Number(gsap.getProperty(images[next], 'yPercent'))
      if (Math.abs(nextY) >= 100)
        gsap.set(images[next], { yPercent: 100 * dir })
      gsap.to(images[next], { ...imageTween, yPercent: 0 })

      items.forEach((item, i) => {
        gsap.to(item, {
          opacity: i === next ? 1 : DIM_OPACITY,
          duration: reduced ? 0 : ITEM_DURATION,
          ease: ITEM_EASE,
          overwrite: true,
        })
        if (i === next) item.setAttribute('aria-current', 'true')
        else item.removeAttribute('aria-current')
      })
      images.forEach((img, i) =>
        img.setAttribute('aria-hidden', String(i !== next)),
      )
    }

    const ctx = gsap.context(() => {
      // Стартовое положение — в yPercent, а не transform из класса (GSAP
      // прочитал бы его как y в px и смешал бы с yPercent).
      gsap.set(images, { y: 0, yPercent: (i) => (i === 0 ? 0 : 100) })
      gsap.set(items, { opacity: (i) => (i === 0 ? 1 : DIM_OPACITY) })

      const slides = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const next = Math.round(self.progress * (count - 1))
          // ctx.add — чтобы твины из колбэка тоже откатились в cleanup
          if (next !== current) ctx.add(() => goTo(next))
        },
      })

      // Клик по пункту — прокрутка в точку, где этот слайд активен (середина
      // его участка). Мгновенно: пока секция прилипла, экран не сдвигается,
      // а onUpdate сразу переключает на нужный слайд одной сменой, без
      // мелькания промежуточных.
      scrollToSlide = (index) => {
        const { start, end } = slides
        window.scrollTo({
          top: start + ((end - start) * index) / (count - 1),
          behavior: 'instant',
        })
      }

      // Картинки под рамкой обрезаны overflow, и ленивая загрузка считает их
      // невидимыми — грузим все заранее, за экран до секции.
      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom+=100%',
        once: true,
        onEnter: () => images.forEach((img) => (img.loading = 'eager')),
      })
    }, root)

    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element).closest('.Slider-list-button')
      const item = button?.closest<HTMLElement>('.Slider-list-item')
      if (item) scrollToSlide(items.indexOf(item))
    }
    root.addEventListener('click', onClick)

    return () => {
      root.removeEventListener('click', onClick)
      ctx.revert()
    }
  }, [rootRef])
}
