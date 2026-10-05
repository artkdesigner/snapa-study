/*
  Положение верха элемента в документе (px от начала страницы) по потоку, а
  не по тому, где он сейчас на экране. Нужно для прилипающих (sticky) секций:
  пока секция прилипла, getBoundingClientRect() отдаёт её «прилипшее» место,
  и ScrollTrigger, пересчитанный в этот момент (ресайз посреди страницы),
  посчитал бы точки неправильно.
  Для sticky-элемента верх = верх родителя + его padding + высоты предыдущих
  соседей (sticky-секции стоят в родителе подряд, без отступов).
*/
export function flowTop(el: HTMLElement): number {
  const parent = el.parentElement
  if (!parent || getComputedStyle(el).position !== 'sticky') {
    return el.getBoundingClientRect().top + window.scrollY
  }
  let top = flowTop(parent) + parseFloat(getComputedStyle(parent).paddingTop)
  for (
    let sibling = parent.firstElementChild;
    sibling && sibling !== el;
    sibling = sibling.nextElementSibling
  ) {
    top += (sibling as HTMLElement).offsetHeight
  }
  return top
}
