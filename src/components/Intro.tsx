import { useRef } from 'react'
import { useScrollLinesReveal } from '../lib/useScrollLinesReveal'

/*
  Экран-манифест: заголовок и подпись по центру светлого экрана. В Figma
  колонка центрирована по вертикали во фрейме высотой с вьюпорт, поэтому
  здесь — min-h-svh + flex-центровка, ширины блоков из макета.
  Наезжает поверх прилипшего Hero (relative z-10). При доскролле строки
  обоих текстов выезжают снизу из-под масок, при скролле назад — уезжают.
*/
function Intro() {
  const rootRef = useRef<HTMLElement>(null)
  useScrollLinesReveal(rootRef)

  return (
    <section
      ref={rootRef}
      aria-labelledby="intro-title"
      className="Intro relative z-10 flex min-h-svh flex-col items-center justify-center gap-6 bg-bg-primary px-2.5 text-center text-accent md:gap-10 md:px-0 lg:gap-15"
    >
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
        Instant photography reimagined with clean design, powerful features, and
        photographs worth keeping.
      </p>
    </section>
  )
}

export default Intro
