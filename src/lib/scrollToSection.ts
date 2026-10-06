import { flowTop } from './flowTop'
import { scrollPage } from './useSmoothScroll'

// Высота 100svh в px (у мобильных браузеров отличается от innerHeight).
function svhPx() {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;height:100svh;visibility:hidden'
  document.body.append(probe)
  const height = probe.offsetHeight
  probe.remove()
  return height
}

/*
  Перейти к секции по id (ссылки меню в Footer). Точка — верх секции по
  потоку (flowTop: секции прилипают, их текущий rect врёт), плюс
  data-anchor-offset в svh, если секция собирается не сразу (BigPrint —
  к концу своего появления). Прыжок мгновенный: плавная прокрутка через
  десятки экранов прогоняла бы все скролл-сцены по дороге.
*/
export function scrollToSection(id: string) {
  const section = document.getElementById(id)
  if (!section) return
  const offsetSvh = Number(section.dataset.anchorOffset ?? 0)
  const top = flowTop(section) + (svhPx() * offsetSvh) / 100
  scrollPage(Math.ceil(top), { immediate: true })
}
