import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  addLinesIn,
  addLinesOut,
  hideLinesNow,
  prepareLines,
  visibleTexts,
  type PreparedLines,
} from './linesReveal'
import { flowTop } from './flowTop'

gsap.registerPlugin(ScrollTrigger)

// Тайминги — в макете не заданы, подобраны; крутить здесь.
// Буквы слогана — как буквы вордмарка в прелоудере (1.6s expo.out), шаг
// между буквами меньше (там 0.16 на 5 букв, здесь 19 букв).
const LETTER = { duration: 1.6, ease: 'expo.out' }
const LETTER_STEP = 0.04
// Шаг между стартами соседних элементов цепочки (и строк — как в
// linesReveal): следующий стартует через STEP после старта предыдущего.
const STEP = 0.1
// Логотип и блоки контактов — opacity + slide-up, как появление пунктов
// Slider (useScrollItemsReveal).
const ITEM = { duration: 0.5, ease: 'power2.out' }
const ITEM_DISTANCE_REM = 1.5
// Линии над меню, логотипом и текстом растут по ширине 0 → 100% от левого
// края — с той же кривой, что строки текста (linesReveal).
const RULE = { duration: 1.2, ease: 'expo.out' }
// Маска слова продлена вниз на столько же (Footer-title-word) — буква
// стартует целиком под ней.
const LETTER_BLEED_EM = 0.2
// Точка запуска: верх секции дошёл до 30% высоты экрана — секция наехала на
// 70%.
const START_VIEWPORT = 0.3
// Mobile и Tablet (до lg): логотип появляется раньше меню — он там стоит
// над меню.
const COMPACT = '(max-width: 61.9375rem)'

/*
  Цепочка появления Footer: буквы слогана выезжают снизу из масок слов →
  строки меню (подпись «Menu» на Desktop и пункты) из строчных масок →
  логотип (на Mobile/Tablet — до меню) → строки текста → соцсети → почта →
  адрес. Один общий шаг STEP
  между стартами (буквы — LETTER_STEP). Линия над меню, логотипом и
  текстом растёт по ширине вместе с появлением своего блока.
  При скролле назад выше точки запуска всё сразу и одновременно уходит
  обратно; смена направления на ходу подхватывает элементы с текущего места.
  Строки меню и текста делятся только на время анимации (как в
  useScrollLinesReveal), буквы слогана — постоянные span[data-letter].
  Ожидаются .Footer-title с [data-letter], .Footer-menu-title,
  .Footer-link-big-text, .Footer-logo, .Footer-text, .Footer-social-wrap,
  .Footer-email-wrap, .Footer-location и линии .Footer-menu-line,
  .Footer-logo-line, .Footer-text-line (origin слева задан классом).
*/
export function useFooterReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const q = (selector: string) =>
      gsap.utils.toArray<HTMLElement>(selector, root)
    const title = root.querySelector<HTMLElement>('.Footer-title')
    const letters = q('.Footer-title [data-letter]')
    const menuTexts = q('.Footer-menu-title, .Footer-link-big-text')
    const text = q('.Footer-text')
    const logo = q('.Footer-logo')
    const contacts = q(
      '.Footer-social-wrap, .Footer-email-wrap, .Footer-location',
    )
    const menuRule = q('.Footer-menu-line')
    const logoRule = q('.Footer-logo-line')
    const textRule = q('.Footer-text-line')
    const rules = [...menuRule, ...logoRule, ...textRule]
    if (!title || !letters.length) return
    const lineTexts = [...menuTexts, ...text]

    const remPx = () =>
      parseFloat(getComputedStyle(document.documentElement).fontSize)
    const letterHidden = () => ({
      yPercent: 100,
      y: parseFloat(getComputedStyle(title).fontSize) * LETTER_BLEED_EM,
    })
    const itemHidden = () => ({ autoAlpha: 0, y: remPx() * ITEM_DISTANCE_REM })

    // Пока идёт анимация в любую сторону — тексты меню и текста поделены на
    // строки (по раскладке текущей ширины).
    let prepared: PreparedLines | null = null
    let tl: gsap.core.Timeline | null = null
    const reset = () => {
      tl?.kill()
      tl = null
      prepared?.revert()
      prepared = null
    }
    // Сначала пустой контекст, потом ctx.add — колбэки ScrollTrigger могут
    // сработать прямо при создании (страница уже прокручена к футеру).
    const ctx = gsap.context(() => {}, root)

    const show = () =>
      ctx.add(() => {
        tl?.kill()
        if (!prepared) {
          // Не поделены — значит, тексты спрятаны целиком.
          prepared = prepareLines(visibleTexts(lineTexts))
          hideLinesNow(prepared.blocks)
          gsap.set(lineTexts, { autoAlpha: 1 })
        }
        // Блоки строк по порядку: сначала меню, последним — текст.
        const blocks = prepared.blocks
        const menuBlocks = blocks.slice(0, -1)
        const textBlocks = blocks.slice(-1)
        const linesCount = (list: typeof blocks) =>
          list.reduce((sum, block) => sum + block.lines.length, 0)
        const item = { ...ITEM, autoAlpha: 1, y: 0 }
        const rule = { ...RULE, scaleX: 1 }

        tl = gsap.timeline({ onComplete: reset })
        let at = 0
        tl.to(
          letters,
          { ...LETTER, yPercent: 0, y: 0, stagger: LETTER_STEP },
          at,
        )
        at += (letters.length - 1) * LETTER_STEP + STEP
        const addMenu = () => {
          tl!.to(menuRule, rule, at)
          addLinesIn(tl!, menuBlocks, at, { sequence: true })
          at += linesCount(menuBlocks) * STEP
        }
        const addLogo = () => {
          tl!.to(logoRule, rule, at)
          tl!.to(logo, item, at)
          at += STEP
        }
        if (window.matchMedia(COMPACT).matches) {
          addLogo()
          addMenu()
        } else {
          addMenu()
          addLogo()
        }
        tl.to(textRule, rule, at)
        addLinesIn(tl, textBlocks, at, { sequence: true })
        at += linesCount(textBlocks) * STEP
        contacts.forEach((el, i) => tl!.to(el, item, at + i * STEP))
      })

    const hide = () =>
      ctx.add(() => {
        tl?.kill()
        // Не поделены — значит, тексты стоят целиком, строки на месте.
        prepared ??= prepareLines(visibleTexts(lineTexts))
        tl = gsap.timeline({
          onComplete: () => {
            gsap.set(lineTexts, { autoAlpha: 0 })
            reset()
          },
        })
        tl.to(letters, { ...LETTER, ...letterHidden() }, 0)
        addLinesOut(tl, prepared.blocks, 0)
        tl.to([...logo, ...contacts], { ...ITEM, ...itemHidden() }, 0)
        tl.to(rules, { ...RULE, scaleX: 0 }, 0)
      })

    ctx.add(() => {
      gsap.set(letters, letterHidden())
      gsap.set(lineTexts, { autoAlpha: 0 })
      gsap.set([...logo, ...contacts], itemHidden())
      gsap.set(rules, { scaleX: 0 })
      ScrollTrigger.create({
        // по потоку — соседние секции прилипают (sticky), см. flowTop
        start: () => flowTop(root) - window.innerHeight * START_VIEWPORT,
        onEnter: show,
        onLeaveBack: hide,
      })
    })

    return () => {
      ctx.revert()
      reset()
    }
  }, [rootRef])
}
