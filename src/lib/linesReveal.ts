import gsap from 'gsap'
import { splitLines } from './splitLines'

// Тайминги — в макете не заданы, подобраны; общие для всех секций.
const LINE_TWEEN = {
  duration: 1.2,
  ease: 'expo.out',
  stagger: 0.1, // между строками внутри одного блока
}
// Маска строки продлена вниз, чтобы не резать хвосты g/p/y (при
// line-height 1) — и стартовый сдвиг на столько же больше.
const MASK_BLEED_EM = 0.2

export type LineBlock = { lines: HTMLElement[]; bleed: number }
export type PreparedLines = { blocks: LineBlock[]; revert: () => void }

// Положение строки, спрятанной под маской.
const hidden = ({ bleed }: LineBlock) => ({ yPercent: 100, y: bleed })

/*
  Делит тексты на строки в масках (строки стоят на месте). revert()
  возвращает исходную разметку — вызывать по окончании анимации и при
  размонтировании.
*/
export function prepareLines(texts: HTMLElement[]): PreparedLines {
  const splits = texts.map((el) => splitLines(el))
  const blocks = splits.map((split, i) => {
    const bleed =
      parseFloat(getComputedStyle(texts[i]).fontSize) * MASK_BLEED_EM
    gsap.set(split.masks, { paddingBottom: bleed, marginBottom: -bleed })
    return { lines: split.lines, bleed }
  })

  let reverted = false
  return {
    blocks,
    revert: () => {
      if (reverted) return
      reverted = true
      splits.forEach((split) => split.revert())
    },
  }
}

// Сразу спрятать строки под маски.
export function hideLinesNow(blocks: LineBlock[]) {
  blocks.forEach((block) => gsap.set(block.lines, hidden(block)))
}

/*
  Выезд строк снизу из-под масок (с текущего положения): строки внутри блока
  по очереди, блоки стартуют одновременно с `position` или, при `sequence`,
  друг за другом — следующий сразу после окончания предыдущего.
*/
export function addLinesIn(
  tl: gsap.core.Timeline,
  blocks: LineBlock[],
  position: gsap.Position,
  { sequence = false }: { sequence?: boolean } = {},
) {
  blocks.forEach(({ lines }, i) => {
    // '>' — конец предыдущего добавленного в таймлайн блока
    const at = i > 0 && sequence ? '>' : position
    tl.to(lines, { yPercent: 0, y: 0, ...LINE_TWEEN }, at)
  })
}

// Уезд строк обратно под маски — все блоки одновременно.
export function addLinesOut(
  tl: gsap.core.Timeline,
  blocks: LineBlock[],
  position: gsap.Position,
) {
  blocks.forEach((block) =>
    tl.to(block.lines, { ...hidden(block), ...LINE_TWEEN }, position),
  )
}

/*
  Разовый выезд: делит тексты, сразу прячет строки (без кадра с целым
  текстом до старта) и добавляет выезд в таймлайн. Возвращает revert.
*/
export function addLinesReveal(
  tl: gsap.core.Timeline,
  texts: HTMLElement[],
  position: gsap.Position,
): () => void {
  const { blocks, revert } = prepareLines(texts)
  hideLinesNow(blocks)
  addLinesIn(tl, blocks, position)
  return revert
}

// Тексты, которые реально отрисованы на текущем брейкпоинте (без display: none).
export const visibleTexts = (texts: HTMLElement[]) =>
  texts.filter((el) => el.getClientRects().length > 0)
