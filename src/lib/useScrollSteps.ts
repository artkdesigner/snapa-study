import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flowTop } from './flowTop'
import { scrollPage } from './useSmoothScroll'

gsap.registerPlugin(ScrollTrigger)

// Тайминги — в макете не заданы, подобраны; крутить здесь.
const SCREEN_DURATION = 0.6
const SCREEN_EASE = 'power2.inOut'
const TEXT_OUT_DURATION = 0.4
const TEXT_IN_DURATION = 0.6
// новый текст проявляется, когда старый уже почти погас (на Tablet они
// стоят на одном месте)
const TEXT_IN_DELAY = 0.3
const TEXT_EASE = 'power2.out'

/*
  Шаги (раскадровка «Steps 01–05»): 5 состояний — вступление (заголовок
  секции) и 4 шага. Секция высотой в несколько экранов, внутри прилипает
  .Steps-pin; первые (состояний − 1) экранов прокрутки делятся на состояния
  так же, как в Slider (смена на 0.5, 1.5, 2.5… экранах), запас после них —
  последний шаг стоит. Смена — анимацией по времени, не скрабом.
  Что меняется (как в кадрах):
  - экран телефона: экраны лежат стопкой, сверху — экран вступления, под ним
    шаги 1–4; виден экран i, пока состояние ≤ i. Вперёд — верхний гаснет и
    открывает следующий; назад — гаснувший проявляется обратно поверх;
  - текст: блок шага (.Steps-item) виден только на своём шаге; старый
    гаснет, новый проявляется. Заголовок секции (.Steps-title-wrap) гаснет
    на шагах только на Desktop — там блоки шагов встают на его место; на
    Mobile/Tablet он сверху и стоит всегда;
  - пункт списка: aria-current на активном — обводку/цифру 100% и раскрытие
    подписи задаёт CSS в Steps.tsx.
  Клик по .Steps-list-button — прокрутка к шагу своего пункта.
*/
export function useScrollSteps(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const screens = gsap.utils.toArray<HTMLImageElement>('.Steps-screen', root)
    const texts = gsap.utils.toArray<HTMLElement>('.Steps-item', root)
    const items = gsap.utils.toArray<HTMLElement>('.Steps-list-item', root)
    const intro = root.querySelector<HTMLElement>('.Steps-title-wrap')
    const pin = root.querySelector<HTMLElement>('.Steps-pin')
    const count = screens.length
    if (!pin || !intro || count < 2) return

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const time = (seconds: number) => (reduced ? 0 : seconds)
    // текст состояния: 0 — заголовок секции, k — блок шага k
    const blocks = [intro, ...texts]
    const desktop = window.matchMedia('(min-width: 62rem)')
    const isVisible = (block: number, state: number) =>
      block === state || (block === 0 && !desktop.matches)
    let current = 0
    let scrollToStep = (_state: number) => {}

    const markCurrent = (state: number) => {
      items.forEach((item, i) => {
        if (i === state - 1) item.setAttribute('aria-current', 'step')
        else item.removeAttribute('aria-current')
      })
      screens.forEach((screen, i) =>
        screen.setAttribute('aria-hidden', String(i !== state)),
      )
    }

    const goTo = (next: number) => {
      const prev = current
      current = next

      // Экраны. Видимый — верхний непогашенный, поэтому анимируется только
      // он; остальные (под ним, не видны) — сразу в итог. Исключение —
      // назад через несколько шагов: промежуточные лежат между новым и
      // старым, их включаем, когда новый проявился целиком.
      gsap.killTweensOf(screens)
      const between = next < prev ? screens.slice(next + 1, prev) : []
      screens.forEach((screen, i) => {
        if (i === prev || i === next || between.includes(screen)) return
        gsap.set(screen, { opacity: i >= next ? 1 : 0 })
      })
      if (next > prev) {
        gsap.set(screens[next], { opacity: 1 })
        gsap.to(screens[prev], {
          opacity: 0,
          duration: time(SCREEN_DURATION),
          ease: SCREEN_EASE,
        })
      } else {
        gsap.to(screens[next], {
          opacity: 1,
          duration: time(SCREEN_DURATION),
          ease: SCREEN_EASE,
          onComplete: () => gsap.set(between, { opacity: 1 }),
        })
      }

      blocks.forEach((block, i) => {
        if (isVisible(i, next)) {
          gsap.to(block, {
            opacity: 1,
            duration: time(TEXT_IN_DURATION),
            delay: time(TEXT_IN_DELAY),
            ease: TEXT_EASE,
            overwrite: true,
          })
        } else {
          gsap.to(block, {
            opacity: 0,
            duration: time(TEXT_OUT_DURATION),
            ease: TEXT_EASE,
            overwrite: true,
          })
        }
      })

      markCurrent(next)
    }

    // Сначала пустой контекст, потом ctx.add: ScrollTrigger может вызвать
    // onUpdate прямо при создании (страница уже прокручена внутрь секции),
    // а onUpdate обращается к ctx.
    const ctx = gsap.context(() => {}, root)
    ctx.add(() => {
      gsap.set(screens, { opacity: 1 })
      gsap.set(blocks, { opacity: (i) => (isVisible(i, 0) ? 1 : 0) })
      markCurrent(0)

      const steps = ScrollTrigger.create({
        start: () => flowTop(root),
        // смены — на первых (count − 1) экранах (высота Steps-pin), запас
        // секции после них в прогресс не входит
        end: () => flowTop(root) + (count - 1) * pin.offsetHeight,
        onUpdate: (self) => {
          const next = Math.round(self.progress * (count - 1))
          // ctx.add — чтобы твины из колбэка тоже откатились в cleanup
          if (next !== current) ctx.add(() => goTo(next))
        },
      })

      // Мгновенно: пока секция прилипла, экран не сдвигается, а onUpdate
      // сразу переключает на нужный шаг одной сменой.
      scrollToStep = (state) => {
        const { start, end } = steps
        scrollPage(start + ((end - start) * state) / (count - 1), {
          immediate: true,
        })
      }
    })

    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element).closest('.Steps-list-button')
      const item = button?.closest<HTMLElement>('.Steps-list-item')
      // пункт i — шаг i + 1 (состояние 0 — вступление)
      if (item) scrollToStep(items.indexOf(item) + 1)
    }
    root.addEventListener('click', onClick)

    // Смена брейкпоинта посреди шагов — заголовок секции сразу в нужное
    // состояние (на Desktop погашен, на Mobile/Tablet виден).
    const onBreakpoint = () =>
      gsap.set(intro, { opacity: isVisible(0, current) ? 1 : 0 })
    desktop.addEventListener('change', onBreakpoint)

    return () => {
      root.removeEventListener('click', onClick)
      desktop.removeEventListener('change', onBreakpoint)
      ctx.revert()
    }
  }, [rootRef])
}
