import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import PopupCard from './PopupCard'
import logo from '../assets/logo-dark.svg'
import img1376 from '../assets/popup-1376.webp'
import img2752 from '../assets/popup-2752.webp'
import pearl from '../assets/popup-card-pearl.webp'
import black from '../assets/popup-card-black.webp'
import beige from '../assets/popup-card-beige.webp'
import paper from '../assets/popup-card-paper.webp'
import strap from '../assets/popup-card-strap.webp'
import protectiveCase from '../assets/popup-card-case.webp'

/*
  Попап заказа на весь экран. Шапка (логотип, закрыть) под линией, ниже
  фото камеры и форма. Mobile/Tablet: фото над формой, весь попап
  прокручивается внутри себя, шапка прилипает к верху попапа (sticky, свой
  фон на всю ширину — контент уезжает под неё, линия — по ширине контента). Desktop: фото слева, форма справа на всю высоту
  (верх и низ формы разнесены); если окно ниже макета — тоже прокрутка.
  Форма: камера — одна на выбор (radio, по макету выбран Pearl), аксессуары —
  сколько угодно (checkbox); итог = цена камеры + цены аксессуаров.
  Поля доставки: в DOM мобильный порядок (имя, фамилия, телефон, страна,
  город, адрес), на Tablet/Desktop сетка 3×2 — страна/город/адрес в первом
  ряду.
  <dialog> через showModal(): поверх всего (top layer), страница под ним
  недоступна, фокус внутри, Esc закрывает. Выезжает справа за 1.2s (медленно
  в начале, быстро в середине, плавно тормозит к концу), уезжает обратно вправо за 0.8s по такому же графику; прокрутка страницы на это время остановлена (Lenis, Home),
  data-lenis-prevent — колесо внутри попапа прокручивает сам попап.
*/
// Появление: медленный старт, разгон, торможение к концу (по просьбе).
const OPEN_DURATION = 1.2
const OPEN_EASE = 'power3.inOut'
const CLOSE_DURATION = 0.8
const CLOSE_EASE = 'power3.inOut'

const CAMERAS = [
  { id: 'pearl', title: 'Pearl', price: 250, img: pearl },
  { id: 'matte-black', title: 'Matte Black', price: 275, img: black },
  { id: 'soft-beige', title: 'Soft Beige', price: 275, img: beige },
]
const ACCESSORIES = [
  { id: 'paper-pack', title: 'Extra Paper Pack', price: 20, img: paper },
  {
    id: 'strap',
    // на Mobile в макете — в две строки, как соседние карточки
    title: (
      <>
        Camera <br className="md:hidden" />
        Strap
      </>
    ),
    price: 50,
    img: strap,
  },
  {
    id: 'case',
    title: 'Protective Case',
    price: 100,
    img: protectiveCase,
  },
]
const FIELDS = [
  { name: 'first-name', label: 'First Name', autoComplete: 'given-name' },
  { name: 'last-name', label: 'Last Name', autoComplete: 'family-name' },
  { name: 'phone', label: 'Phone', autoComplete: 'tel', type: 'tel' },
  {
    name: 'country',
    label: 'Country',
    autoComplete: 'country-name',
    row: 'md:row-start-1',
  },
  {
    name: 'city',
    label: 'City',
    autoComplete: 'address-level2',
    row: 'md:row-start-1',
  },
  {
    name: 'address',
    label: 'Address',
    autoComplete: 'street-address',
    row: 'md:row-start-1',
  },
]

type PopupProps = {
  open: boolean
  onClose: () => void
}

function Popup({ open, onClose }: PopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const [camera, setCamera] = useState(CAMERAS[0].id)
  const [accessories, setAccessories] = useState<string[]>([])

  const total =
    (CAMERAS.find(({ id }) => id === camera)?.price ?? 0) +
    ACCESSORIES.filter(({ id }) => accessories.includes(id)).reduce(
      (sum, { price }) => sum + price,
      0,
    )

  const toggleAccessory = (id: string) =>
    setAccessories((list) =>
      list.includes(id) ? list.filter((item) => item !== id) : [...list, id],
    )

  // Выезд справа / уезд вправо. Закрывается (close()) только после уезда.
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    tweenRef.current?.kill()
    if (open) {
      if (!dialog.open) {
        gsap.set(dialog, { xPercent: 100 })
        dialog.showModal()
        // каждый раз открывается с начала
        dialog.scrollTop = 0
      }
      tweenRef.current = gsap.to(dialog, {
        xPercent: 0,
        duration: reduced ? 0 : OPEN_DURATION,
        ease: OPEN_EASE,
      })
    } else if (dialog.open) {
      tweenRef.current = gsap.to(dialog, {
        xPercent: 100,
        duration: reduced ? 0 : CLOSE_DURATION,
        ease: CLOSE_EASE,
        onComplete: () => dialog.close(),
      })
    }
  }, [open])

  useLayoutEffect(() => () => void tweenRef.current?.kill(), [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="popup-title"
      data-lenis-prevent
      // Esc: вместо мгновенного закрытия — уезд (onClose → open=false)
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // если браузер всё же закрыл сам — синхронизировать состояние
      onClose={onClose}
      className="Popup m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-bg-primary p-0 text-dark backdrop:bg-transparent"
    >
      <div className="Popup-inner flex min-h-full flex-col gap-2.5 px-2.5 pb-20 md:gap-5 md:px-5 lg:gap-7.5 lg:p-7.5">
        {/* Верхний отступ попапа — внутри шапки, чтобы прилипшая шапка
            сохраняла его */}
        <div className="Popup-header sticky top-0 z-10 -mx-2.5 bg-bg-primary px-2.5 pt-5 md:-mx-5 md:px-5 lg:static lg:mx-0 lg:px-0 lg:pt-0">
          <div className="Popup-header-inner flex items-center justify-between border-b border-dark/20 pb-5 lg:pb-7.5">
            <img
              src={logo}
              alt="Snapa"
              draggable={false}
              className="Popup-logo block h-auto w-[2.3125rem] md:w-[2.6875rem]"
            />
            {/* Hover — как у остальных кнопок: 70%, Ease out 300ms (в макете
              состояния нет) */}
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="Popup-close flex size-7.5 cursor-pointer items-center justify-center rounded-full border border-dark transition-opacity duration-300 ease-[cubic-bezier(0,0,0.58,1)] hover:opacity-70 md:size-10"
            >
              <svg
                aria-hidden="true"
                viewBox="13 13 14 14"
                className="Popup-close-icon size-3.5"
                fill="currentColor"
              >
                <path d="M21.0287 19.9841L26.8317 14.1967C26.9464 14.0631 27.0063 13.8913 26.9995 13.7156C26.9927 13.5399 26.9196 13.3732 26.795 13.2489C26.6703 13.1246 26.5032 13.0517 26.327 13.0449C26.1508 13.0382 25.9786 13.0979 25.8447 13.2123L20.0417 18.9998L14.2387 13.2053C14.1069 13.0739 13.9281 13 13.7417 13C13.5553 13 13.3765 13.0739 13.2447 13.2053C13.1129 13.3368 13.0388 13.5151 13.0388 13.701C13.0388 13.8869 13.1129 14.0652 13.2447 14.1967L19.0547 19.9841L13.2447 25.7716C13.1714 25.8342 13.1119 25.9112 13.0699 25.9978C13.0279 26.0844 13.0042 26.1788 13.0005 26.2749C12.9968 26.3711 13.013 26.4669 13.0482 26.5565C13.0834 26.6461 13.1368 26.7275 13.205 26.7955C13.2732 26.8636 13.3548 26.9168 13.4447 26.9519C13.5345 26.987 13.6306 27.0032 13.727 26.9995C13.8234 26.9958 13.918 26.9722 14.0049 26.9303C14.0917 26.8884 14.1689 26.8291 14.2317 26.756L20.0417 20.9685L25.8447 26.756C25.9786 26.8703 26.1508 26.9301 26.327 26.9233C26.5032 26.9165 26.6703 26.8437 26.795 26.7194C26.9196 26.595 26.9927 26.4284 26.9995 26.2527C27.0063 26.077 26.9464 25.9052 26.8317 25.7716L21.0287 19.9841Z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="Popup-content flex flex-col gap-5 lg:flex-1 lg:flex-row lg:gap-7.5">
          <div className="Popup-img relative h-50 shrink-0 overflow-clip md:h-[27.8125rem] lg:h-auto lg:flex-1">
            <img
              src={img1376}
              srcSet={`${img1376} 1376w, ${img2752} 2752w`}
              // Desktop: фото 16:9 заполняет почти квадрат — по высоте
              sizes="(min-width: 62rem) 86vw, 100vw"
              alt="Snapa instant camera on the rocks"
              draggable={false}
              className="absolute inset-0 size-full object-cover"
            />
          </div>

          <form
            onSubmit={(event) => event.preventDefault()}
            className="Popup-form flex flex-col gap-7.5 lg:flex-1 lg:justify-between"
          >
            <div className="Popup-form-top flex flex-col gap-5 md:gap-7.5">
              <h2
                id="popup-title"
                className="Popup-form-title text-heading-sm text-dark/50 md:text-heading-md lg:text-heading-lg"
              >
                Purchase your
                <br />
                <span className="text-dark">Snapa Instant Camera</span>
              </h2>

              <div
                role="radiogroup"
                aria-labelledby="popup-camera-title"
                className="Popup-cards-wrap flex flex-col gap-2.5 md:gap-4"
              >
                <p
                  id="popup-camera-title"
                  className="Popup-card-list-title text-body text-dark/50"
                >
                  Choose Your Camera
                </p>
                <div className="Popup-card-list flex gap-2.5 md:gap-4">
                  {CAMERAS.map(({ id, title, price, img }) => (
                    <PopupCard
                      key={id}
                      type="radio"
                      name="camera"
                      value={id}
                      checked={camera === id}
                      onChange={() => setCamera(id)}
                      title={title}
                      price={price}
                      img={img}
                      className="h-25 md:h-37.5"
                    />
                  ))}
                </div>
              </div>

              <div
                role="group"
                aria-labelledby="popup-accessories-title"
                className="Popup-cards-wrap flex flex-col gap-2.5 md:gap-4"
              >
                <p
                  id="popup-accessories-title"
                  className="Popup-card-list-title text-body text-dark/50"
                >
                  Choose your Accessories
                </p>
                <div className="Popup-card-list flex gap-2.5 md:gap-4">
                  {ACCESSORIES.map(({ id, title, price, img }) => (
                    <PopupCard
                      key={id}
                      type="checkbox"
                      name="accessories"
                      value={id}
                      checked={accessories.includes(id)}
                      onChange={() => toggleAccessory(id)}
                      title={title}
                      price={price}
                      img={img}
                      className="h-29.5 md:h-37.5"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="Popup-form-bottom flex flex-col gap-5 md:gap-7.5">
              <div className="Popup-form-fields-wrap flex flex-col gap-2.5 md:gap-4">
                <p className="Popup-form-fields-title text-body text-dark">
                  Shipping Information
                </p>
                <div className="Popup-form-fields grid gap-2.5 md:grid-cols-3 lg:gap-5">
                  {FIELDS.map(({ name, label, autoComplete, type, row }) => (
                    <input
                      key={name}
                      name={name}
                      type={type ?? 'text'}
                      autoComplete={autoComplete}
                      placeholder={label}
                      aria-label={label}
                      className={`Input h-12 w-full min-w-0 bg-dark/2 px-5 text-body text-dark outline-dark placeholder:text-dark/50 focus-visible:outline md:h-[3.4375rem] ${row ?? 'md:row-start-2'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="Popup-form-total flex flex-col items-center gap-5 border-t border-dark/20 pt-5 md:flex-row md:justify-between md:pt-7.5">
                <p
                  aria-live="polite"
                  className="Popup-form-price text-title-sm md:text-title-lg"
                >
                  ${total}
                </p>
                <button
                  type="submit"
                  className="Button-form flex h-12.5 w-full cursor-pointer items-center justify-center rounded-full bg-dark px-7.5 text-body text-primary transition-opacity duration-300 ease-[cubic-bezier(0,0,0.58,1)] hover:opacity-70 md:h-15 md:w-[20.875rem]"
                >
                  Order
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  )
}

export default Popup
