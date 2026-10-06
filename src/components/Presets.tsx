import { useRef, type CSSProperties } from 'react'
import photoSm from '../assets/choose-4-1920.webp'
import photoLg from '../assets/choose-4-2912.webp'
import { CHOOSE_TO_PRESETS_SCREENS } from '../lib/useChooseToPresets'
import { useCoverOverlay } from '../lib/useCoverOverlay'
import Polaroid from './Polaroid'

/*
  Пресеты: экран, в углах — четыре коротких тезиса (Presets-top и
  Presets-bottom, разнесены space-between), сверху по центру — заголовок
  поверх тезисов, по центру экрана — полароид поверх всего.
  Слои как в макете: полароид над заголовком, заголовок над тезисами,
  нижние тезисы под всем.
  Переход из Choose (src/lib/useChooseToPresets.ts): секция поднята под
  конец Choose (отрицательный margin) и прилипает (Presets-pin), пока
  поверх неё секция Choose сжимается в полароид. Свой полароид здесь в
  это время прозрачный — это мишень: по его размеру и месту хук считает,
  куда сжаться полароиду Choose, и тот ложится ровно на него. С «уменьшить
  движение» перехода нет: секция идёт обычным экраном после Choose, и
  видно этот полароид.
  Полароид: повёрнут на −5°, центр — от центра экрана со сдвигом из макета
  (везде ниже центра, по горизонтали — по центру).
  В конце секция сама прилипает (sticky, top = экран минус её высота), и на
  неё наезжает Steps — Presets-overlay затемняет её по мере накрытия
  (src/lib/useCoverOverlay.ts).
  Фото: кадр ~16:9 в портретной рамке упирается в высоту — sizes = высота
  рамки × пропорции файла.
*/
const PHOTO_SIZES =
  '(min-width: 62rem) 58.4vw, (min-width: 30.0625rem) 111vw, 154vw'
// Высота секции в переходе: экраны перехода + сам экран Presets.
const OVERLAP = { '--overlap': `${(CHOOSE_TO_PRESETS_SCREENS + 1) * 100}svh` }

function Presets() {
  const rootRef = useRef<HTMLElement>(null)
  useCoverOverlay(rootRef)

  return (
    // sticky с top = экран минус высота секции: прилипает, когда Presets-pin
    // дошёл до её конца, и стоит, пока наезжает Steps
    <section
      ref={rootRef}
      aria-labelledby="presets-title"
      style={OVERLAP as CSSProperties}
      className="Presets sticky top-0 isolate z-45 h-svh bg-bg-primary text-accent motion-safe:-mt-(--overlap) motion-safe:top-[calc(100svh-var(--overlap))] motion-safe:h-(--overlap)"
    >
      <div className="Presets-pin sticky top-0 flex h-svh flex-col justify-between overflow-clip px-2.5 py-5 md:px-5 md:py-15 lg:p-7.5">
        <h2
          id="presets-title"
          className="Presets-title absolute inset-x-2.5 top-[6.0625rem] z-3 text-center text-poster-sm md:inset-x-5 md:top-[8.5rem] md:text-poster-md lg:inset-x-0 lg:top-7.5 lg:text-poster-lg"
        >
          <span className="block">Presets</span>{' '}
          <span className="block">that shape your image</span>
        </h2>

        <div className="Presets-top relative z-2 flex items-start justify-between text-body md:text-body-md lg:text-body-lg">
          {/* На Desktop строки — как в Figma: первая занимает почти всю
              ширину и могла бы перенестись иначе (br только на Desktop) */}
          <p className="Presets-top-left w-[10rem] md:w-[14.25rem] lg:w-[18.4375rem] lg:whitespace-nowrap">
            More space for detail, faces, and{' '}
            <br className="hidden lg:inline" />
            atmosphere in every photograph.
          </p>
          <p className="Presets-top-right w-[10rem] text-right md:w-[14.25rem] lg:w-[18.5rem]">
            Natural tones and balanced contrast that stay vivid over time.
          </p>
        </div>

        <div className="Presets-photo pointer-events-none absolute inset-0 z-4 flex items-center justify-center motion-safe:opacity-0">
          <Polaroid
            data-presets-polaroid
            className="relative top-[5.1333rem] [transform:rotate(-5deg)] md:top-[4.4881rem] md:left-0 lg:top-[3.32rem] lg:left-0"
          >
            <div className="Choose-mask-photo relative h-[20.25rem] w-[18rem] overflow-clip bg-bg-primary md:h-[29.6691rem] md:w-[26.3603rem] lg:h-[39.25rem] lg:w-[35rem]">
              <img
                src={photoLg}
                srcSet={`${photoSm} 1920w, ${photoLg} 2912w`}
                sizes={PHOTO_SIZES}
                alt="Freckled woman among red poppies"
                loading="lazy"
                decoding="async"
                draggable={false}
                className="Choose-mask-img absolute inset-0 block size-full max-w-none object-cover"
              />
            </div>
          </Polaroid>
        </div>

        <div className="Presets-bottom relative z-1 flex items-start justify-between text-body md:text-body-md lg:text-body-lg">
          <p className="Presets-bottom-left w-[10rem] md:w-[12.75rem] lg:w-[16.125rem] lg:whitespace-nowrap">
            Thick, tactile paper designed <br className="hidden lg:inline" />
            to feel as good as it looks.
          </p>
          <p className="Presets-bottom-right w-[8.875rem] text-right md:w-[11.25rem] lg:w-[14.5rem]">
            A real photograph you can hold, keep, and share.
          </p>
        </div>

        {/* внутри прилипшего Presets-pin, над полароидом — затемняет
            видимый экран, пока наезжает Steps */}
        <div
          aria-hidden="true"
          data-cover-overlay
          className="Presets-overlay pointer-events-none absolute inset-0 z-5 bg-dark opacity-0"
        />
      </div>
    </section>
  )
}

export default Presets
