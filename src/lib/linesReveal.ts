import gsap from 'gsap'
import { splitLines } from './splitLines'

// Тайминги — в макете не заданы, подобраны; общие для всех секций.
const LINE_DURATION = 1.2
const LINE_STAGGER = 0.1 // между строками внутри одного блока
const LINE_EASE = 'expo.out'
// Маска строки продлена вниз, чтобы не резать хвосты g/p/y (при
// line-height 1) — и стартовый сдвиг на столько же больше.
const MASK_BLEED_EM = 0.2

/*
  Делит тексты на строки и добавляет в таймлайн их выезд снизу из-под масок:
  все блоки стартуют одновременно с `position`, строки внутри блока — по
  очереди. Возвращает функцию, которая возвращает исходную разметку
  (вызывать по окончании анимации и при размонтировании).
*/
export function addLinesReveal(
  tl: gsap.core.Timeline,
  texts: HTMLElement[],
  position: gsap.Position,
): () => void {
  const splits = texts.map((el) => splitLines(el))

  splits.forEach((split, i) => {
    const bleed =
      parseFloat(getComputedStyle(texts[i]).fontSize) * MASK_BLEED_EM
    gsap.set(split.masks, { paddingBottom: bleed, marginBottom: -bleed })
    tl.set(split.lines, { yPercent: 100, y: bleed }, 0)
    tl.to(
      split.lines,
      {
        yPercent: 0,
        y: 0,
        duration: LINE_DURATION,
        ease: LINE_EASE,
        stagger: LINE_STAGGER,
      },
      position,
    )
  })

  let reverted = false
  return () => {
    if (reverted) return
    reverted = true
    splits.forEach((split) => split.revert())
  }
}

// Тексты, которые реально отрисованы на текущем брейкпоинте (без display: none).
export const visibleTexts = (texts: HTMLElement[]) =>
  texts.filter((el) => el.getClientRects().length > 0)
