import { useLayoutEffect } from 'react'

// Клавиши, которые прокручивают страницу.
const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
])

const prevent = (event: Event) => {
  if (event.cancelable) event.preventDefault()
}
const preventKeys = (event: KeyboardEvent) => {
  if (SCROLL_KEYS.has(event.key)) prevent(event)
}

/*
  Полная блокировка прокрутки, пока компонент на странице (прелоудер):
  overflow: hidden у html плюс гасим сами жесты — колесо/тачпад, палец
  (iOS Safari прокручивает и при overflow: hidden) и клавиши. Включается до
  первой отрисовки (layout effect), снимается при размонтировании. Lenis при
  этом тоже остановлен (useSmoothScroll(paused)). Прокрутка из кода
  (scrollPage, восстановление места после перезагрузки) работает.
*/
export function useScrollLock() {
  useLayoutEffect(() => {
    const html = document.documentElement
    html.style.overflow = 'hidden'
    const options = { passive: false } as const
    window.addEventListener('wheel', prevent, options)
    window.addEventListener('touchmove', prevent, options)
    window.addEventListener('keydown', preventKeys)

    return () => {
      html.style.overflow = ''
      window.removeEventListener('wheel', prevent)
      window.removeEventListener('touchmove', prevent)
      window.removeEventListener('keydown', preventKeys)
    }
  }, [])
}
