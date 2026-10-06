import gsap from 'gsap'
import { splitLetters, splitLines } from './splitLines'

// Тайминги — в макете не заданы, подобраны; общие для всех секций.
const LINE_TWEEN = {
  duration: 1.2,
  ease: 'expo.out',
  stagger: 0.1, // между строками внутри одного блока
}
// Побуквенно — как вордмарк в прелоудере (Preloader.tsx: 1.6s expo.out),
// шаг меньше: букв в заголовке много.
const LETTER_TWEEN = {
  duration: 1.6,
  ease: 'expo.out',
  stagger: 0.04, // между буквами — сквозь все строки блока подряд
}
// Маска строки продлена вниз, чтобы не резать хвосты g/p/y (при
// line-height 1) — и стартовый сдвиг на столько же больше.
const MASK_BLEED_EM = 0.2

// lines — то, что выезжает из масок: строки или, у побуквенного блока
// (letters), буквы всех его строк по порядку.
export type LineBlock = {
  lines: HTMLElement[]
  bleed: number
  letters: boolean
}
export type PreparedLines = { blocks: LineBlock[]; revert: () => void }

// Положение строки, спрятанной под маской.
const hidden = ({ bleed }: LineBlock) => ({ yPercent: 100, y: bleed })

/*
  Делит тексты на строки в масках (строки стоят на месте). Текст с
  атрибутом data-reveal-letters дополнительно делится на буквы — они
  выезжают из-под маски своей строки по одной. revert() возвращает исходную
  разметку — вызывать по окончании анимации и при размонтировании.
*/
export function prepareLines(texts: HTMLElement[]): PreparedLines {
  const splits = texts.map((el) => splitLines(el))
  const blocks = splits.map((split, i) => {
    const bleed =
      parseFloat(getComputedStyle(texts[i]).fontSize) * MASK_BLEED_EM
    gsap.set(split.masks, { paddingBottom: bleed, marginBottom: -bleed })
    const letters = 'revealLetters' in texts[i].dataset
    const lines = letters ? split.lines.flatMap(splitLetters) : split.lines
    return { lines, bleed, letters }
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
  одной общей очередью — первая строка следующего блока идёт через тот же
  шаг stagger после последней строки предыдущего.
*/
export function addLinesIn(
  tl: gsap.core.Timeline,
  blocks: LineBlock[],
  position: gsap.Position,
  { sequence = false }: { sequence?: boolean } = {},
) {
  const tween = (block: LineBlock) =>
    block.letters ? LETTER_TWEEN : LINE_TWEEN
  blocks.forEach((block, i) => {
    const prev = blocks[i - 1]
    // '<+=…' — от старта предыдущего блока, через все его строки
    const at =
      prev && sequence
        ? `<+=${prev.lines.length * tween(prev).stagger}`
        : position
    tl.to(block.lines, { yPercent: 0, y: 0, ...tween(block) }, at)
  })
}

// Уезд строк (и букв) обратно под маски — все блоки одновременно, внутри
// блока — по очереди строк.
export function addLinesOut(
  tl: gsap.core.Timeline,
  blocks: LineBlock[],
  position: gsap.Position,
) {
  blocks.forEach((block) =>
    tl.to(
      block.lines,
      { ...hidden(block), ...(block.letters ? LETTER_TWEEN : LINE_TWEEN) },
      position,
    ),
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
