import bigprintSm from '../assets/bigprint-1280.webp'
import bigprintMd from '../assets/bigprint-2560.webp'
import bigprintLg from '../assets/bigprint-3660.webp'

// Запас прокрутки, пока BigPrint-pin прилип, — под появление элементов по
// скроллу (следующий шаг).
const EXTRA_SVH = 100

/*
  Большие отпечатки: наезжает поверх прилипшего Mask (z-40). Секция выше
  экрана на EXTRA_SVH, внутри прилипает (sticky) BigPrint-pin на экран.
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
  return (
    <section
      aria-labelledby="bigprint-title"
      style={{ height: `${100 + EXTRA_SVH}svh` }}
      className="BigPrint relative z-40 bg-bg-primary text-accent"
    >
      <div className="BigPrint-pin sticky top-0 flex h-svh flex-col items-center gap-15 px-2.5 py-10 md:px-5 md:py-15 lg:flex-row lg:items-end lg:gap-7.5 lg:p-7.5">
        <div className="BigPrint-left flex w-full flex-col items-center gap-10 text-center lg:h-full lg:flex-1 lg:items-start lg:justify-between lg:gap-0 lg:text-left">
          {/* «Bigg prints» в Figma — опечатка */}
          <h2
            id="bigprint-title"
            className="BigPrint-title w-full text-poster-sm md:text-poster-md lg:text-poster-lg"
          >
            Big prints
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
      </div>
    </section>
  )
}

export default BigPrint
