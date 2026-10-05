import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'

/*
  Раскадровка «Preloader to Hero 01–05» (desktop 1920, шрифт 330px). Геометрия
  в em от размера вордмарка, поэтому на Tablet/Mobile масштабируется сама:
  - маска 290px = 0.8788em, верх маски на 7px (0.0212em) выше верха заглавных;
  - в покое (кадр 04) заглавные отцентрированы по вертикали экрана;
  - буква стартует на 300px ниже покоя (0.9091em) — целиком под маской;
  - уходит на 310px вверх (0.9394em) — с запасом на хвост «p» (0.193em).
*/
const LETTERS = ['S', 'n', 'a', 'p', 'a']
const IN_EM = 0.9091
const OUT_EM = 0.9394

// Тайминги — в макете не заданы, подобраны; крутить здесь.
const START_DELAY = 0.3 // кадр 01: пустой тёмный экран
const LETTER_DURATION = 0.8
const LETTER_STAGGER = 0.08
const LETTER_EASE = 'expo.out'
const MOVE_DURATION = 1 // кадр 04 → 05: переезд на место Hero-snapa
const MOVE_EASE = 'expo.inOut'
const FADE_DURATION = 0.6 // временно: уход тёмного фона до шага «появление Hero»

type PreloaderProps = {
  targetRef: RefObject<HTMLElement | null>
  onDone: () => void
}

function waitForLoad() {
  return new Promise<void>((resolve) => {
    if (document.readyState === 'complete') resolve()
    else window.addEventListener('load', () => resolve(), { once: true })
  })
}

function Preloader({ targetRef, onDone }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const mask = maskRef.current
    const row = rowRef.current
    if (!root || !mask || !row) return

    let cancelled = false
    let loaded = false
    waitForLoad().then(() => {
      loaded = true
    })

    // Финальная позиция меряется от верха страницы — держим её там.
    const html = document.documentElement
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    html.style.overflow = 'hidden'

    const ctx = gsap.context(() => {})
    const play = (build: (tl: gsap.core.Timeline) => void) =>
      new Promise<void>((resolve) => {
        ctx.add(() => {
          const tl = gsap.timeline({ onComplete: resolve })
          build(tl)
        })
      })
    const em = () => parseFloat(getComputedStyle(mask).fontSize)

    let front = gsap.utils.toArray<HTMLElement>('[data-letter="front"]', row)
    let back = gsap.utils.toArray<HTMLElement>('[data-letter="back"]', row)

    const run = async () => {
      // Буквы без General Sans выглядят чужими — ждём шрифт до старта.
      await document.fonts.load('500 1em "General Sans"').catch(() => {})
      if (cancelled) return

      // Кадр 01 → 02: буквы по очереди выезжают из-под маски.
      await play((tl) => {
        tl.set([...front, ...back], { y: IN_EM * em() })
        tl.set(row, { visibility: 'visible' })
        tl.to(front, {
          y: 0,
          duration: LETTER_DURATION,
          ease: LETTER_EASE,
          stagger: LETTER_STAGGER,
          delay: START_DELAY,
        })
      })

      // Кадр 03: пока сайт грузится, буквы уезжают вверх, снизу приезжают такие же.
      while (!loaded && !cancelled) {
        await play((tl) => {
          const size = em()
          tl.set(back, { y: IN_EM * size })
          tl.to(
            front,
            {
              y: -OUT_EM * size,
              duration: LETTER_DURATION,
              ease: LETTER_EASE,
              stagger: LETTER_STAGGER,
            },
            0,
          )
          tl.to(
            back,
            {
              y: 0,
              duration: LETTER_DURATION,
              ease: LETTER_EASE,
              stagger: LETTER_STAGGER,
            },
            0,
          )
        })
        ;[front, back] = [back, front]
      }
      if (cancelled) return

      // Кадр 04 → 05: маска снимается, слово едет точно на место Hero-snapa.
      const target = targetRef.current
      await play((tl) => {
        tl.set(mask, { overflow: 'visible' })
        if (target) {
          const from = row.getBoundingClientRect()
          const to = target.getBoundingClientRect()
          tl.to(row, {
            x: to.left - from.left,
            y: to.top - from.top,
            duration: MOVE_DURATION,
            ease: MOVE_EASE,
          })
        }
        // Слово лежит ровно поверх h1, поэтому гасим прелоудер целиком.
        tl.to(root, { autoAlpha: 0, duration: FADE_DURATION })
      })
      if (!cancelled) onDone()
    }
    run()

    return () => {
      cancelled = true
      ctx.revert()
      html.style.overflow = ''
    }
  }, [targetRef, onDone])

  return (
    <div
      ref={rootRef}
      className="Preloader fixed inset-0 z-50 bg-dark text-primary"
      aria-hidden="true"
    >
      <div
        ref={maskRef}
        className="Preloader-mask absolute top-1/2 left-2.5 -mt-[0.3803em] h-[0.8788em] overflow-hidden pt-[0.0212em] text-display-sm md:left-5 md:text-display-md lg:left-7.5 lg:text-display-lg"
      >
        <div
          ref={rowRef}
          className="Preloader-snapa invisible flex whitespace-nowrap"
        >
          {LETTERS.map((letter, i) => (
            <span key={i} className="relative">
              <span data-letter="front" className="trim-cap block">
                {letter}
              </span>
              <span
                data-letter="back"
                className="trim-cap absolute top-0 left-0 block"
              >
                {letter}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Preloader
