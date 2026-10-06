/*
  Делит уже свёрстанный текст на строки ровно так, как их перенёс браузер.

  SplitText из GSAP тут не подходит: он режет текст на слова по пробелам и
  делает каждое слово неразрывным блоком, поэтому «large-format» во время
  анимации не переносится по дефису, а после revert() половина слова
  перепрыгивает на следующую строку. Здесь строки берутся из реальной
  раскладки: позиция каждого символа через Range, без вмешательства в переносы.

  Каждая строка оборачивается в маску (overflow: clip). Исходные узлы React
  откладываются и возвращаются в revert() — те же самые, не копии.
*/
export type SplitLinesResult = {
  lines: HTMLElement[]
  masks: HTMLElement[]
  revert: () => void
}

export function splitLines(el: HTMLElement): SplitLinesResult {
  const range = document.createRange()
  const lineThreshold = parseFloat(getComputedStyle(el).fontSize) / 2
  const texts: string[] = []
  let current = ''
  let lineTop: number | null = null

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? ''
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      // Пробелы на стыке строк не имеют надёжной позиции — к текущей строке.
      if (/\s/.test(char)) {
        current += ' '
        continue
      }
      range.setStart(node, i)
      range.setEnd(node, i + 1)
      const { top } = range.getBoundingClientRect()
      if (lineTop !== null && top - lineTop > lineThreshold) {
        texts.push(current)
        current = ''
      }
      if (lineTop === null || top - lineTop > lineThreshold) lineTop = top
      current += char
    }
  }
  texts.push(current)

  const original = Array.from(el.childNodes)
  const masks: HTMLElement[] = []
  const lines: HTMLElement[] = []
  for (const text of texts) {
    const clean = text.replace(/\s+/g, ' ').trim()
    if (!clean) continue
    const mask = document.createElement('span')
    mask.style.display = 'block'
    mask.style.overflow = 'clip'
    const line = document.createElement('span')
    line.style.display = 'block'
    line.textContent = clean
    mask.append(line)
    masks.push(mask)
    lines.push(line)
  }
  el.replaceChildren(...masks)

  return {
    lines,
    masks,
    revert: () => el.replaceChildren(...original),
  }
}
