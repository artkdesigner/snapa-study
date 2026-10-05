import { useRef } from 'react'
import { useScrollLinesReveal } from '../lib/useScrollLinesReveal'
import { useCoverOverlay } from '../lib/useCoverOverlay'

/*
  Экран-манифест: заголовок и подпись по центру светлого экрана. В Figma
  колонка центрирована по вертикали во фрейме высотой с вьюпорт, поэтому
  здесь — Intro-content min-h-svh + flex-центровка, ширины блоков из макета.
  Снизу секции — ещё 50svh пустой прокрутки (pb): прилипшая Intro стоит на
  экране, пока они проматываются, и Slider наезжает не сразу.
  Наезжает поверх прилипшего Hero (z-10), сама прилипает (sticky), и на неё
  наезжает Slider; Intro-overlay затемняет её по мере накрытия
  (src/lib/useCoverOverlay.ts). Строки обоих текстов выезжают снизу из-под
  масок, при скролле назад — уезжают.
*/
function Intro() {
  const rootRef = useRef<HTMLElement>(null)
  useScrollLinesReveal(rootRef)
  useCoverOverlay(rootRef)

  return (
    <section
      ref={rootRef}
      aria-labelledby="intro-title"
      className="Intro sticky top-0 z-10 bg-bg-primary pb-[50svh] text-center text-accent"
    >
      <div className="Intro-content flex min-h-svh flex-col items-center justify-center gap-6 px-2.5 md:gap-10 md:px-0 lg:gap-15">
        <h2
          id="intro-title"
          data-reveal-lines
          className="Intro-title w-full text-headline-sm md:w-[43rem] md:text-headline-md lg:w-[89rem] lg:text-headline-lg"
        >
          Snapa is a new generation instant camera built for people who want
          better photos and real printed memories.
        </h2>
        <p
          data-reveal-lines
          className="Intro-sub w-[17.5rem] text-lead-sm md:w-[20.375rem] lg:w-[21.875rem] lg:text-lead-lg"
        >
          Instant photography reimagined with clean design, powerful features,
          and photographs worth keeping.
        </p>
      </div>

      <div
        aria-hidden="true"
        data-cover-overlay
        className="Intro-overlay pointer-events-none absolute inset-0 bg-black opacity-0"
      />
    </section>
  )
}

export default Intro
