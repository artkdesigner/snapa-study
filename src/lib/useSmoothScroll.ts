import { useLayoutEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
  Плавный скролл — Lenis поверх нативного (sticky и ScrollTrigger работают
  как обычно). Lenis крутится на тикере GSAP, ScrollTrigger обновляется на
  каждый его шаг — анимации не отстают от сглаженного скролла.
  Тач-скролл Lenis по умолчанию не сглаживает — на телефонах родная инерция.
  При prefers-reduced-motion не включается.

  Прокручивать страницу из кода — только через scrollPage(): прямой
  window.scrollTo в обход Lenis сбивает его внутреннее положение.
*/
let lenis: Lenis | null = null

export function scrollPage(top: number, { immediate = false } = {}) {
  if (lenis) lenis.scrollTo(top, { immediate, force: true })
  else window.scrollTo({ top, behavior: immediate ? 'instant' : 'smooth' })
}

// paused — заблокировать прокрутку (например, пока идёт прелоудер).
export function useSmoothScroll(paused = false) {
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const instance = new Lenis()
    lenis = instance
    instance.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      instance.destroy()
      if (lenis === instance) lenis = null
    }
  }, [])

  useLayoutEffect(() => {
    if (paused) lenis?.stop()
    else lenis?.start()
  }, [paused])
}
