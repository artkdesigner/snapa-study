import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flowTop } from './flowTop'
import { hideLinesNow, prepareLines, type PreparedLines } from './linesReveal'

gsap.registerPlugin(ScrollTrigger)

// Прокрутка под анимацию, пока BigPrint-pin прилип. Высота секции в
// BigPrint.tsx = экран + этот запас. Все позиции и длительности ниже — тоже
// в svh прокрутки: таймлайн длиной ANIM_SVH растянут ровно на запас.
export const BIGPRINT_ANIM_SVH = 200

// Тайминги — в макете не заданы, подобраны; крутить здесь.
// Буквы заголовка — как Snapa в прелоудере: по очереди из-под маски, expo.out.
const TITLE_AT = 0
const LETTER_SVH = 50
const LETTER_STEP_SVH = 5
// Маска заголовка продлена вниз (pb/-mb в BigPrint.tsx), чтобы не резать
// хвосты g/p, — стартовый сдвиг букв на столько же больше.
const TITLE_BLEED_EM = 0.2
// BigPrint-middle: по очереди снизу + проявление.
const MIDDLE_AT = 80
const ITEM_SVH = 30
const ITEM_STEP_SVH = 10
const ITEM_SHIFT_REM = 1.5
// BigPrint-text: построчно из-под масок.
const TEXT_AT = 130
const LINE_SVH = 40
const LINE_STEP_SVH = 8

/*
  Появление BigPrint-left по скроллу. Пока секция наезжает, видна только
  картинка. Когда BigPrint-pin прилип, на следующих BIGPRINT_ANIM_SVH
  прокрутки по очереди: буквы заголовка → элементы BigPrint-middle → строки
  BigPrint-text. Привязано к скроллу (scrub), назад откатывается само.
  Текст поделен на строки всё время (скраб может остановиться на любом
  месте) — по раскладке текущей ширины, при смене ширины делится заново.
  Ожидаются .BigPrint-pin, .BigPrint-title с [data-letter], элементы
  .BigPrint-middle-title/-numbers/-sub и .BigPrint-text внутри rootRef.
*/
export function useBigPrintReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const pin = root.querySelector<HTMLElement>('.BigPrint-pin')
    const title = root.querySelector<HTMLElement>('.BigPrint-title')
    const text = root.querySelector<HTMLElement>('.BigPrint-text')
    if (!pin || !title || !text) return
    const letters = gsap.utils.toArray<HTMLElement>('[data-letter]', title)
    const items = gsap.utils.toArray<HTMLElement>(
      '.BigPrint-middle-title, .BigPrint-middle-numbers, .BigPrint-middle-sub',
      root,
    )

    let ctx: gsap.Context | null = null
    let split: PreparedLines | null = null
    const teardown = () => {
      ctx?.revert()
      ctx = null
      split?.revert()
      split = null
    }

    const build = () => {
      teardown()
      const { blocks } = (split = prepareLines([text]))
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      )
      const bleed =
        parseFloat(getComputedStyle(title).fontSize) * TITLE_BLEED_EM

      ctx = gsap.context(() => {
        // Стартовые состояния — до таймлайна: твины запомнят их как начало.
        gsap.set(letters, { yPercent: 100, y: bleed })
        gsap.set(items, { autoAlpha: 0, y: ITEM_SHIFT_REM * rem })
        hideLinesNow(blocks)

        const tl = gsap.timeline({
          scrollTrigger: {
            // от прилипания пина до конца секции; по потоку — как у соседей
            start: () => flowTop(root),
            end: () => flowTop(root) + root.offsetHeight - pin.offsetHeight,
            scrub: true,
          },
        })
        tl.to(
          letters,
          {
            yPercent: 0,
            y: 0,
            duration: LETTER_SVH,
            ease: 'expo.out',
            stagger: LETTER_STEP_SVH,
          },
          TITLE_AT,
        )
        tl.to(
          items,
          {
            autoAlpha: 1,
            y: 0,
            duration: ITEM_SVH,
            ease: 'power2.out',
            stagger: ITEM_STEP_SVH,
          },
          MIDDLE_AT,
        )
        blocks.forEach(({ lines }) =>
          tl.to(
            lines,
            {
              yPercent: 0,
              y: 0,
              duration: LINE_SVH,
              ease: 'expo.out',
              stagger: LINE_STEP_SVH,
            },
            TEXT_AT,
          ),
        )
        // Пустой хвост до конца запаса — чтобы единицы таймлайна были svh.
        tl.set({}, {}, BIGPRINT_ANIM_SVH)
      }, root)
    }

    // Строки зависят от шрифта и ширины: делим после загрузки шрифта и
    // заново при смене ширины (смена только высоты — панель браузера на
    // телефоне — переносы не меняет).
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) build()
    })
    let width = window.innerWidth
    let timer = 0
    const onResize = () => {
      if (window.innerWidth === width) return
      width = window.innerWidth
      clearTimeout(timer)
      timer = window.setTimeout(build, 200)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelled = true
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
      teardown()
    }
  }, [rootRef])
}
