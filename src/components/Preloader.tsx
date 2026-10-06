import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { WORDMARK_LETTERS, WORDMARK_LETTER_CLASS } from '../lib/wordmark'
import { scrollPage } from '../lib/useSmoothScroll'

/*
  Раскадровка «Preloader to Hero 01–05» (desktop 1920, шрифт 330px). Геометрия
  в em от размера вордмарка, поэтому на Tablet/Mobile масштабируется сама:
  - верх маски на 7px (0.0212em) выше верха заглавных;
  - высота маски 0.95em (в макете 290px = 0.8788em, но так резался хвост «p»
    — он 0.193em под базовой линией; теперь низ маски на 0.21em под ней);
  - в покое (кадр 04) заглавные отцентрированы по вертикали экрана;
  - буква стартует на 0.95em ниже покоя — целиком под маской;
  - уходит на 0.95em вверх — вместе с хвостом «p».
*/
const IN_EM = 0.95
const OUT_EM = 0.95

// Тайминги — в макете не заданы, подобраны; крутить здесь.
const START_DELAY = 0.1 // кадр 01: пустой тёмный экран
const LETTER_DURATION = 1.6
const LETTER_STAGGER = 0.16
const LETTER_EASE = 'expo.out'
const MOVE_DURATION = 1 // кадр 04 → 05: переезд на место Hero-snapa
const MOVE_EASE = 'expo.inOut'
const FADE_DURATION = 0.6 // исчезновение прелоудера, после него — появление Hero
// Пауза между фазами: следующая стартует через GAP после того, как предыдущая
// визуально закончилась — кривая прошла SETTLE пути. Формального конца не
// ждём: у expo.out последняя треть длительности — почти неподвижный хвост.
const GAP = 0.1
const SETTLE = 0.99

// Когда твин с такой кривой и длительностью визуально доехал.
function settleTime(ease: string, duration: number) {
  const curve = gsap.parseEase(ease)
  let t = 0
  while (t < 1 && curve(t) < SETTLE) t += 0.005
  return Math.min(t, 1) * duration
}

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

    // Финальная позиция меряется от верха страницы — держим её там
    // (восстановление прокрутки браузером выключено в index.html).
    const html = document.documentElement
    window.scrollTo(0, 0)
    html.style.overflow = 'hidden'

    const ctx = gsap.context(() => {})
    // build возвращает момент, когда пора запускать следующую фазу (не
    // дожидаясь конца таймлайна), или ничего — тогда ждём конца.
    const play = (build: (tl: gsap.core.Timeline) => number | void) =>
      new Promise<void>((resolve) => {
        ctx.add(() => {
          const tl = gsap.timeline({ onComplete: resolve })
          const next = build(tl)
          if (next !== undefined) tl.call(resolve, undefined, next)
        })
      })
    const em = () => parseFloat(getComputedStyle(mask).fontSize)

    let front = gsap.utils.toArray<HTMLElement>('[data-letter="front"]', row)
    let back = gsap.utils.toArray<HTMLElement>('[data-letter="back"]', row)
    // Последняя буква визуально доехала — с начала её очереди.
    const lettersSettled =
      (front.length - 1) * LETTER_STAGGER +
      settleTime(LETTER_EASE, LETTER_DURATION)

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
        return START_DELAY + lettersSettled + GAP
      })

      // Кадр 03: буквы уезжают вверх, снизу приезжают такие же. Минимум один
      // раз всегда, дальше — пока сайт грузится.
      do {
        await play((tl) => {
          const size = em()
          // Прошлая фаза ещё дотягивает хвосты: запасные (ушли наверх, за
          // маской) — останавливаем и ставим вниз; видимые подхватываем с
          // текущего места (overwrite), без рывка.
          gsap.killTweensOf(back)
          tl.set(back, { y: IN_EM * size })
          tl.to(
            front,
            {
              y: -OUT_EM * size,
              duration: LETTER_DURATION,
              ease: LETTER_EASE,
              stagger: LETTER_STAGGER,
              overwrite: 'auto',
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
          return lettersSettled + GAP
        })
        ;[front, back] = [back, front]
      } while (!loaded && !cancelled)
      if (cancelled) return

      // Кадр 04 → 05: маска снимается, слово едет точно на место Hero-snapa.
      // Запасные буквы ждут под маской — прячем, иначе без маски они видны
      // второй надписью под словом.
      const target = targetRef.current
      await play((tl) => {
        tl.set(back, { visibility: 'hidden' })
        tl.set(mask, { overflow: 'visible' })
        if (target) {
          // Страница могла уехать вниз, пока шёл прелоудер (браузер вернул
          // прокрутку после перезагрузки) — тогда h1 над экраном и слово
          // улетело бы вверх. Возвращаем наверх перед замером; через
          // scrollPage — чтобы Lenis знал о новом положении.
          scrollPage(0, { immediate: true })
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
        tl.to(
          root,
          { autoAlpha: 0, duration: FADE_DURATION },
          target ? settleTime(MOVE_EASE, MOVE_DURATION) + GAP : 0,
        )
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
        className="Preloader-mask absolute top-1/2 left-2.5 -mt-[0.3803em] h-[0.95em] overflow-hidden pt-[0.0212em] text-display-sm md:left-5 md:text-display-md lg:left-7.5 lg:text-display-lg"
      >
        <div
          ref={rowRef}
          className="Preloader-snapa invisible flex whitespace-nowrap"
        >
          {WORDMARK_LETTERS.map((letter, i) => (
            <span key={i} className={`relative ${WORDMARK_LETTER_CLASS}`}>
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
