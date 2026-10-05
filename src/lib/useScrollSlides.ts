import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flowTop } from './flowTop'
import { scrollPage } from './useSmoothScroll'

gsap.registerPlugin(ScrollTrigger)

// Тайминги — в макете не заданы, подобраны; крутить здесь.
const IMAGE_DURATION = 1
const IMAGE_EASE = 'expo.inOut'

/*
  Секция высотой в N экранов (+ запас в конце), внутри прилипает (sticky)
  .Slider-pin на экран. Первые N−1 экранов прокрутки делятся на N слайдов:
  слайд меняется на 0.5, 1.5, 2.5… экранах; запас после них — последний
  слайд просто стоит. Смена — анимацией по времени, не скрабом: старая
  картинка уезжает вверх, новая приезжает снизу (при скролле назад —
  наоборот), активному пункту списка ставится aria-current — его яркость
  (и hover остальных) задаёт CSS в Slider.tsx, не GSAP: инлайновый opacity
  перебивал бы hover.
  Клик по .Slider-list-button перелистывает на слайд своего пункта.
  Ожидаются .Slider-img и .Slider-list-item внутри rootRef.
*/
export function useScrollSlides(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const images = gsap.utils.toArray<HTMLImageElement>('.Slider-img', root)
    const items = gsap.utils.toArray<HTMLElement>('.Slider-list-item', root)
    const pin = root.querySelector<HTMLElement>('.Slider-pin')
    const count = images.length
    if (!pin || count < 2) return

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

    const markCurrent = (index: number) => {
      items.forEach((item, i) => {
        if (i === index) item.setAttribute('aria-current', 'true')
        else item.removeAttribute('aria-current')
      })
      images.forEach((img, i) =>
        img.setAttribute('aria-hidden', String(i !== index)),
      )
    }

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

      markCurrent(next)
    }

    // Сначала пустой контекст, потом ctx.add: ScrollTrigger может вызвать
    // onUpdate прямо при создании (страница уже прокручена внутрь секции —
    // восстановление скролла, горячая перезагрузка), а onUpdate обращается к
    // ctx — внутри gsap.context(() => …) он был бы ещё не объявлен.
    const ctx = gsap.context(() => {}, root)
    ctx.add(() => {
      // Стартовое положение — в yPercent, а не transform из класса (GSAP
      // прочитал бы его как y в px и смешал бы с yPercent).
      gsap.set(images, { y: 0, yPercent: (i) => (i === 0 ? 0 : 100) })
      markCurrent(0)

      const slides = ScrollTrigger.create({
        // по потоку: секция прилипает в конце (sticky), прилипший rect врёт
        start: () => flowTop(root),
        // смены — на первых N−1 экранах (высота Slider-pin), запас секции
        // после них в прогресс не входит
        end: () => flowTop(root) + (count - 1) * pin.offsetHeight,
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
        scrollPage(start + ((end - start) * index) / (count - 1), {
          immediate: true,
        })
      }

      // Картинки под рамкой обрезаны overflow, и ленивая загрузка считает их
      // невидимыми — грузим все заранее, за экран до секции.
      ScrollTrigger.create({
        start: () => flowTop(root) - window.innerHeight * 2,
        once: true,
        onEnter: () => images.forEach((img) => (img.loading = 'eager')),
      })
    })

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
