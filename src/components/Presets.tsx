import paper from '../assets/presets-paper.webp'
import photoSm from '../assets/choose-4-1920.webp'
import photoLg from '../assets/choose-4-2912.webp'

/*
  Пресеты: экран (h-svh), в углах — четыре коротких тезиса (Presets-top и
  Presets-bottom, разнесены space-between), сверху по центру — заголовок
  поверх тезисов, по центру экрана — полароид (Choose-mask) поверх всего.
  В Figma полароид — это секция Choose, уменьшенная до карточки: внутри та
  же разметка Choose, но её заголовок и декор разнесены за края, видно
  только верхнее фото (Moon Dust). В статике — просто это фото.
  Слои как в макете: полароид над заголовком, заголовок над тезисами,
  нижние тезисы под всем (на Tablet полароид заходит на них).
  Полароид: белая карточка с текстурой бумаги (20%), повёрнута на −5°, тень
  пропорциональна размеру карточки. Центр карточки — от центра экрана со
  сдвигом из макета (Mobile — ниже, Tablet — ниже и левее, Desktop — ровно
  по центру): relative top/left, чтобы transform остался свободным для
  анимации.
  Подпись на карточке — рукописный Kobzar KS.
  Фото: кадр ~16:9 в портретной рамке упирается в высоту — sizes = высота
  рамки × пропорции файла.
*/
const PHOTO_SIZES =
  '(min-width: 62rem) 58.4vw, (min-width: 30.0625rem) 125vw, 154vw'

function Presets() {
  return (
    <section
      aria-labelledby="presets-title"
      className="Presets relative isolate flex h-svh flex-col justify-between overflow-clip bg-bg-primary px-2.5 py-5 text-accent md:px-5 md:py-15 lg:p-7.5"
    >
      <h2
        id="presets-title"
        className="Presets-title absolute inset-x-2.5 top-[6.0625rem] z-3 text-center text-poster-sm md:inset-x-5 md:top-[8.5rem] md:text-poster-md lg:inset-x-0 lg:top-7.5 lg:text-poster-lg"
      >
        <span className="block">Presets</span>{' '}
        <span className="block">that shape your image</span>
      </h2>

      <div className="Presets-top relative z-2 flex items-start justify-between text-body md:text-body-md lg:text-body-lg">
        <p className="Presets-top-left w-[10rem] md:w-[14.25rem] lg:w-[21.75rem]">
          More space for detail, faces, and atmosphere in every photograph.
        </p>
        <p className="Presets-top-right w-[10rem] text-right md:w-[14.25rem] lg:w-[18.5rem]">
          Natural tones and balanced contrast that stay vivid over time.
        </p>
      </div>

      <div className="Presets-photo pointer-events-none absolute inset-0 z-4 flex items-center justify-center">
        <figure className="Choose-mask relative top-[5.1333rem] flex flex-col gap-2.5 overflow-clip bg-primary p-2.5 shadow-[1rem_1rem_1.3333rem_rgb(1_13_24/0.1)] [transform:rotate(-5deg)] md:top-[4.495rem] md:left-[-1.3889rem] md:gap-4 md:p-4 md:shadow-[1.6619rem_1.6619rem_2.2159rem_rgb(1_13_24/0.1)] lg:top-0 lg:left-0 lg:gap-5 lg:p-5 lg:shadow-[1.9428rem_1.9428rem_2.5904rem_rgb(1_13_24/0.1)]">
          <img
            src={paper}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className="Choose-mask-paper absolute inset-0 block size-full max-w-none object-cover opacity-20"
          />
          <div className="Choose-mask-photo relative h-[20.25rem] w-[18rem] overflow-clip bg-bg-primary md:h-[33.625rem] md:w-[29.875rem] lg:h-[39.25rem] lg:w-[35rem]">
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
          <figcaption className="Choose-mask-bottom relative flex flex-col items-end font-script leading-none font-normal">
            <span className="Choose-mask-date self-stretch text-[1.125rem] md:text-[1.875rem] lg:text-[2.1919rem]">
              April 2026
            </span>
            <span className="Choose-mask-city-wrap text-[2.673rem] md:text-[4.375rem] lg:text-[5.1146rem]">
              Italy
            </span>
          </figcaption>
        </figure>
      </div>

      <div className="Presets-bottom relative z-1 flex items-start justify-between text-body md:text-body-md lg:text-body-lg">
        <p className="Presets-bottom-left w-[10rem] md:w-[12.75rem] lg:w-[25rem]">
          Thick, tactile paper designed to feel as good as it looks.
        </p>
        <p className="Presets-bottom-right w-[8.875rem] text-right md:w-[11.25rem] lg:w-[14.5rem]">
          A real photograph you can hold, keep, and share.
        </p>
      </div>
    </section>
  )
}

export default Presets
