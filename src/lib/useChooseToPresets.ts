import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flowTop } from './flowTop'
import { chooseScrollScreens } from './useChooseSlides'

gsap.registerPlugin(ScrollTrigger)

// Экранов прокрутки на переход Choose → Presets. Высота Choose и наложение
// Presets на её конец (Choose.tsx, Presets.tsx) считаются от этого.
export const CHOOSE_TO_PRESETS_SCREENS = 2

// Запас пути заголовка и декора сверх их размера (100px макета), rem.
const FLY_EXTRA_REM = 6.25

/*
  Кадры раскадровки «Choose to Presets 01–05» (Desktop), равномерно по
  переходу; между кадрами — линейно (плавность даёт Lenis).
  fly — заголовок и декор Choose уехали за края (0…1).
  w, h — окно фото: 0 — весь экран, 1 — фото полароида в Presets; ширина и
  высота идут по-разному: в кадре 03 фото уже, высота ещё как у экрана, к 05
  становится портретным. В макете высота в кадре 03 больше экрана — фото
  на наклоне сначала росло; по просьбе пользователя убрано (h: 0).
  center — центр полароида: 0 — фото ровно на экране (рамка за краями),
  1 — место полароида в Presets.
  rotation — наклон, градусы.
*/
const FRAMES = [
  { fly: 0, w: 0, h: 0, center: 0, rotation: 0 },
  { fly: 0.61, w: 0, h: 0, center: 0, rotation: 0 },
  { fly: 1, w: 0.172, h: 0, center: 1, rotation: -3 },
  { fly: 1, w: 0.619, h: 0.177, center: 1, rotation: -5 },
  { fly: 1, w: 1, h: 1, center: 1, rotation: -5 },
]
type Frame = (typeof FRAMES)[number]

const frameAt = (progress: number): Frame => {
  const pos = gsap.utils.clamp(0, 1, progress) * (FRAMES.length - 1)
  const i = Math.min(Math.floor(pos), FRAMES.length - 2)
  return gsap.utils.interpolate(FRAMES[i], FRAMES[i + 1], pos - i)
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t

/*
  Choose сжимается в фотографию Presets. Секция Choose после смены слайдов
  ещё CHOOSE_TO_PRESETS_SCREENS экранов стоит прилипшей (Choose-stage), под
  ней прилип Presets (поднят под её конец). Choose-pin с самого начала лежит
  в полароиде (.Choose-mask): фото = экран, поля и подпись — за краями
  экрана. По скроллу (scrub) окно фото (Choose-pin) меняет размер, полароид
  поворачивается и встаёт на место полароида Presets
  ([data-presets-polaroid], он прозрачный — мишень). Заголовок и декор
  Choose: на Desktop разъезжаются за края влево и вправо; на Mobile/Tablet
  декор уезжает вниз, а заголовок стоит на месте и гаснет до 0.
  Mobile/Tablet идут по тем же кадрам, что Desktop.
  Всё пишется инлайном на каждый шаг скролла по замерам (refresh): размер
  экрана, поля полароида, размер и центр мишени.
*/
export function useChooseToPresets(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const stage = root.querySelector<HTMLElement>('.Choose-stage')
    const polaroid = root.querySelector<HTMLElement>('.Choose-mask')
    const pin = root.querySelector<HTMLElement>('.Choose-pin')
    const title = root.querySelector<HTMLElement>('.Choose-title-wrap')
    const decoration = root.querySelector<HTMLElement>('.Choose-decoration')
    const slideCount = root.querySelectorAll('.Choose-group').length
    const target = document.querySelector<HTMLElement>(
      '[data-presets-polaroid]',
    )
    const targetPhoto = target?.querySelector<HTMLElement>('.Choose-mask-photo')
    const presetsPin = target?.closest<HTMLElement>('.Presets-pin')
    if (
      !stage ||
      !polaroid ||
      !pin ||
      !title ||
      !decoration ||
      !target ||
      !targetPhoto ||
      !presetsPin
    )
      return

    const measure = () => {
      const t = target.getBoundingClientRect()
      const p = presetsPin.getBoundingClientRect()
      return {
        stageW: stage.offsetWidth,
        stageH: stage.offsetHeight,
        pad: parseFloat(getComputedStyle(polaroid).paddingTop),
        // всё, что в полароиде кроме фото: поля, отступ и подпись
        extra: polaroid.offsetHeight - pin.offsetHeight,
        endW: targetPhoto.offsetWidth,
        endH: targetPhoto.offsetHeight,
        // центр мишени на экране, когда Presets-pin прилип
        endX: t.left + t.width / 2 - p.left,
        endY: t.top + t.height / 2 - p.top,
        desktop: window.matchMedia('(min-width: 62rem)').matches,
        flyExtra:
          FLY_EXTRA_REM *
          parseFloat(getComputedStyle(document.documentElement).fontSize),
        titleW: title.offsetWidth,
        decW: decoration.offsetWidth,
        decH: decoration.offsetHeight,
        gap: parseFloat(getComputedStyle(pin).rowGap) || 0,
      }
    }
    let m: ReturnType<typeof measure> | null = null

    const render = (progress: number) => {
      if (!m) return
      const f = frameAt(progress)
      const w = lerp(m.stageW, m.endW, f.w)
      const h = lerp(m.stageH, m.endH, f.h)
      // Полароид стоит в Choose-stage со сдвигом на −поля (фото = экран);
      // его центр без transform — от размера фото.
      const restX = w / 2
      const restY = (h + m.extra) / 2 - m.pad
      const x = lerp(m.stageW / 2, m.endX, f.center)
      const y = lerp((m.stageH + m.extra) / 2 - m.pad, m.endY, f.center)
      gsap.set(pin, { width: w, height: h })
      gsap.set(polaroid, { x: x - restX, y: y - restY, rotation: f.rotation })

      if (m.desktop) {
        // заголовок прижат к левому краю, декор — к правому
        const shift = (Math.max(m.titleW, m.decW) + m.flyExtra) * f.fly
        gsap.set(title, { x: -shift, y: 0, opacity: 1 })
        gsap.set(decoration, { x: shift, y: 0 })
      } else {
        // Заголовок стоит на месте и гаснет (по просьбе пользователя), декор
        // уезжает вниз — на тот же путь, что был у пары «заголовок вверх,
        // декор вниз»: колонка прижата к низу, заголовок над декором.
        const titleBottom = h - m.decH - m.gap
        const shift = (Math.max(titleBottom, m.decH) + m.flyExtra) * f.fly
        gsap.set(title, { x: 0, y: 0, opacity: 1 - f.fly })
        gsap.set(decoration, { x: 0, y: shift })
      }
    }

    // Контекст создаём заранее: refresh при create может сразу вызвать
    // колбэки (страница уже прокручена внутрь перехода).
    const ctx = gsap.context(() => {}, root)
    ctx.add(() => {
      const startScreens = chooseScrollScreens(slideCount)
      const st = ScrollTrigger.create({
        start: () => flowTop(root) + stage.offsetHeight * startScreens,
        end: () =>
          flowTop(root) +
          stage.offsetHeight * (startScreens + CHOOSE_TO_PRESETS_SCREENS),
        onRefresh: (self) => {
          m = measure()
          render(self.progress)
        },
        onUpdate: (self) => render(self.progress),
      })
      if (!m) {
        m = measure()
        render(st.progress)
      }
    })

    return () => {
      ctx.revert()
      gsap.set(pin, { clearProps: 'width,height' })
      gsap.set([polaroid, decoration], { clearProps: 'transform' })
      gsap.set(title, { clearProps: 'transform,opacity' })
    }
  }, [rootRef])
}
