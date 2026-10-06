import { scrollPage } from './useSmoothScroll'

/*
  Место на странице при перезагрузке (и возврате назад/вперёд) — сами, а не
  браузером: его восстановление выключено в index.html, потому что
  срабатывает в непредсказуемый момент, а прелоудеру нужно знать, где
  страница стоит, до того как он решит, куда деть слово Snapa.
  Позиция пишется в sessionStorage при уходе со страницы и читается один
  раз при загрузке модуля.
*/
const KEY = 'snapa-scroll'

const navigation = performance.getEntriesByType('navigation')[0] as
  PerformanceNavigationTiming | undefined
const returning =
  navigation?.type === 'reload' || navigation?.type === 'back_forward'
const saved = returning ? Number(sessionStorage.getItem(KEY)) || 0 : 0
sessionStorage.removeItem(KEY)

window.addEventListener('pagehide', () => {
  sessionStorage.setItem(KEY, String(Math.round(window.scrollY)))
})

let restored = false

// Вернуть страницу на сохранённое место — один раз за загрузку (повторный
// запуск эффекта в StrictMode и при горячей перезагрузке в dev — без
// прыжков). Вызывать после создания Lenis, чтобы он знал о новом положении.
export function restoreScroll() {
  if (restored) return
  restored = true
  if (saved > 0) scrollPage(saved, { immediate: true })
}
