import { useRef } from 'react'
import bigprintSm from '../assets/bigprint-1280.webp'
import bigprintMd from '../assets/bigprint-2560.webp'
import bigprintLg from '../assets/bigprint-3660.webp'
import {
  BIGPRINT_ANIM_SVH,
  BIGPRINT_REVEALED_SVH,
  useBigPrintReveal,
} from '../lib/useBigPrintReveal'
import { useCoverOverlay } from '../lib/useCoverOverlay'

const TITLE = 'Bigg prints'
const SECTION_SVH = 100 + BIGPRINT_ANIM_SVH

/*
  Большие отпечатки: наезжает поверх прилипшего Mask (z-40). Секция выше
  экрана на BIGPRINT_ANIM_SVH, внутри прилипает (sticky) BigPrint-pin на
  экран; пока он прилип, по скроллу появляется BigPrint-left (заголовок
  побуквенно → BigPrint-middle → строки текста, src/lib/useBigPrintReveal.ts).
  В конце секция сама прилипает, и на неё наезжает Choose — BigPrint-overlay
  затемняет её (src/lib/useCoverOverlay.ts).
  Заголовок — маска (overflow-clip, продлена вниз под хвосты g/p) с буквами
  отдельными span; читается целиком через aria-label.
  Mobile/Tablet: всё по центру колонкой, текст сверху, картинка снизу
  занимает всё оставшееся место.
  Desktop: две равные колонки на всю высоту — слева текст (заголовок
  сверху, размер посередине, абзац снизу — space-between), справа картинка.
  Картинка: object-cover; на Desktop кадр сдвинут как в Figma (55.7% по
  горизонтали), на Mobile/Tablet — по центру. Кадр ~16:9 в рамке выше его
  пропорций упирается в высоту, поэтому sizes — от высоты экрана (Desktop)
  или с запасом от ширины (Mobile/Tablet).
*/
function BigPrint() {
  const rootRef = useRef<HTMLElement>(null)
  useBigPrintReveal(rootRef)
  useCoverOverlay(rootRef)

  return (
    // Секция sticky с top = экран минус её высота: прилипает, когда
    // BigPrint-pin дошёл до конца, и стоит, пока на неё наезжает Choose.
    <section
      ref={rootRef}
      id="bigprint"
      // ссылка Prints в Footer ведёт к концу появления (scrollToSection)
      data-anchor-offset={BIGPRINT_REVEALED_SVH}
      aria-labelledby="bigprint-title"
      style={{ height: `${SECTION_SVH}svh`, top: `${100 - SECTION_SVH}svh` }}
      className="BigPrint sticky z-40 bg-bg-primary text-accent"
    >
      <div className="BigPrint-pin sticky top-0 flex h-svh flex-col items-center gap-15 px-2.5 py-10 md:px-5 md:py-15 lg:flex-row lg:items-end lg:gap-7.5 lg:p-7.5">
        <div className="BigPrint-left flex w-full flex-col items-center gap-10 text-center lg:h-full lg:flex-1 lg:items-start lg:justify-between lg:gap-0 lg:text-left">
          <h2
            id="bigprint-title"
            aria-label={TITLE}
            className="BigPrint-title -mb-[0.2em] w-full overflow-clip pb-[0.2em] text-poster-sm md:text-poster-md lg:text-poster-lg"
          >
            {Array.from(TITLE).map((char, i) =>
              char === ' ' ? (
                ' '
              ) : (
                <span
                  key={i}
                  data-letter
                  aria-hidden="true"
                  className="inline-block"
                >
                  {char}
                </span>
              ),
            )}
          </h2>

          <div className="BigPrint-middle flex w-full flex-col gap-2.5">
            <dl className="BigPrint-middle-top">
              <dt className="BigPrint-middle-title text-lead-sm lg:text-lead-lg">
                Print size:
              </dt>
              <dd className="BigPrint-middle-numbers text-poster-sm md:text-poster-md lg:text-poster-lg">
                3<span className="text-accent/40">x</span>4
              </dd>
            </dl>
            <p className="BigPrint-middle-sub text-lead-sm lg:text-lead-lg">
              3 × 4 in Larger than most instant formats
            </p>
          </div>

          <p className="BigPrint-text w-full text-title-sm md:text-title-md lg:text-title-lg">
            Snapa prints photos in a larger format than standard instant
            cameras. More space for faces, textures, and composition — without
            compressing the image.
          </p>
        </div>

        <div className="BigPrint-right relative min-h-0 w-full flex-1 overflow-clip lg:h-full">
          <img
            src={bigprintLg}
            srcSet={`${bigprintSm} 1280w, ${bigprintMd} 2560w, ${bigprintLg} 3660w`}
            sizes="(min-width: 62rem) 170vh, 170vw"
            alt="Snapa camera floating above dark rocks with large instant prints scattered below"
            loading="lazy"
            decoding="async"
            draggable={false}
            className="BigPrint-img absolute inset-0 block size-full max-w-none object-cover lg:object-[55.7%_50%]"
          />
        </div>

        {/* внутри прилипшего BigPrint-pin — затемняет видимый экран */}
        <div
          aria-hidden="true"
          data-cover-overlay
          className="BigPrint-overlay pointer-events-none absolute inset-0 bg-dark opacity-0"
        />
      </div>
    </section>
  )
}

export default BigPrint
