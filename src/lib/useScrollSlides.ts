import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flowTop } from './flowTop'
import { scrollPage } from './useSmoothScroll'

gsap.registerPlugin(ScrollTrigger)

// Тайминги — в макете не заданы, подобраны; крутить здесь.
const IMAGE_DURATION = 1
const IMAGE_EASE = 'expo.inOut'
// Смена началась, пока лента ещё едет (быстрый скролл), — без разгона с
// нуля, иначе лента притормаживала бы на каждом новом слайде.
const IMAGE_EASE_MOVING = 'expo.out'

/*
  Секция высотой в N экранов (+ запас в конце), внутри прилипает (sticky)
  .Slider-pin на экран. Первые N−1 экранов прокрутки делятся на N слайдов:
  слайд меняется на 0.5, 1.5, 2.5… экранах; запас после них — последний
  слайд просто стоит. Смена — анимацией по времени, не скрабом.
  Картинки — одна вертикальная лента встык (картинка i сдвинута на
  (i − position) × 100%), анимируется только position: старая уезжает
  вверх, новая приезжает снизу (назад — наоборот). При быстром скролле
  лента едет сразу к нужному слайду — промежуточные проносятся следом
  встык, без пустого фона; новая цель посреди движения — лента
  продолжает ехать с текущего места.
  Активному пункту списка ставится aria-current — его яркость (и hover
  остальных) задаёт CSS в Slider.tsx, не GSAP: инлайновый opacity
  перебивал бы hover.
  Клик по .Slider-list-button перелистывает на слайд своего пункта одной
  сменой: на время перехода лента — только из двух картинок (текущая и
  нужная), промежуточные не мелькают.
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

    const duration = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 0
      : IMAGE_DURATION
    let current = 0
    let scrollToSlide = (_index: number) => {}
    // следующая смена — от клика по пункту (одна смена, без промежуточных)
    let jumpPending = false

    // Лента: порядок картинок и положение в нём (0 — первая в кадре).
    const fullStrip = images.map((_, i) => i)
    let strip = fullStrip
    const position = { value: 0 }
    let tween: gsap.core.Tween | null = null
    const setY = images.map((img) => gsap.quickSetter(img, 'yPercent'))

    const render = () => {
      images.forEach((_, i) => {
        const k = strip.indexOf(i)
        // не в ленте (во время клика) — за кадром со стороны своего места
        const offset = k === -1 ? (i < current ? -1 : 1) : k - position.value
        setY[i](gsap.utils.clamp(-1, 1, offset) * 100)
      })
    }
    // Картинка, которая сейчас больше всех в кадре.
    const shownImage = () => strip[Math.round(position.value)]

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
      const moving = tween?.isActive() ?? false
      const shown = shownImage()
      tween?.kill()
      current = next
      markCurrent(next)

      if (jumpPending && shown !== next) {
        // Клик: лента из двух картинок — текущей и нужной.
        jumpPending = false
        strip = shown < next ? [shown, next] : [next, shown]
        position.value = strip.indexOf(shown)
        tween = gsap.to(position, {
          value: strip.indexOf(next),
          duration,
          ease: IMAGE_EASE,
          onUpdate: render,
          onComplete: () => {
            strip = fullStrip
            position.value = next
            render()
          },
        })
        return
      }
      jumpPending = false

      // Скролл: после клика лента снова полная (с той картинки, что в кадре).
      if (strip !== fullStrip) {
        strip = fullStrip
        position.value = shown
      }
      tween = gsap.to(position, {
        value: next,
        duration,
        ease: moving ? IMAGE_EASE_MOVING : IMAGE_EASE,
        onUpdate: render,
      })
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
      render()
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
        // клик по текущему пункту смены не вызовет — флаг не ставить
        jumpPending = index !== current
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
      tween?.kill()
      ctx.revert()
    }
  }, [rootRef])
}
