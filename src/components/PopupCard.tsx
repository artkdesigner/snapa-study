import type { ReactNode } from 'react'

type PopupCardProps = {
  // radio — выбор одного (камера), checkbox — нескольких (аксессуары)
  type: 'radio' | 'checkbox'
  name: string
  value: string
  checked: boolean
  onChange: () => void
  title: ReactNode
  price: number
  img: string
  className?: string
}

/*
  Figma-компонент Popup-card: название сверху, цена снизу, картинка товара
  по центру под текстом (absolute, object-contain). Карточка — <label> со
  скрытым нативным input: клавиатура, фокус и группа radio работают сами.
  Состояние selected из Figma — по :checked (has-checked): рамка 100% и фон
  dark 2%; без выбора — рамка 20%. Переход — Ease out 300ms, как у Button
  (длительность из Figma не читается).
*/
function PopupCard({
  type,
  name,
  value,
  checked,
  onChange,
  title,
  price,
  img,
  className = '',
}: PopupCardProps) {
  return (
    <label
      className={`Popup-card relative isolate flex min-w-0 flex-1 cursor-pointer flex-col justify-between border border-dark/20 p-2.5 text-lead-sm text-dark transition-colors duration-300 ease-[cubic-bezier(0,0,0.58,1)] has-checked:border-dark has-checked:bg-dark/2 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-dark md:p-4 md:text-lead-lg ${className}`}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <img
        src={img}
        alt=""
        draggable={false}
        className="Popup-card-img pointer-events-none absolute inset-[1.0625rem] -z-1 size-[calc(100%-2.125rem)] object-contain md:inset-[0.9375rem] md:size-[calc(100%-1.875rem)]"
      />
      <span className="Popup-card-title">{title}</span>
      <span className="Popup-card-price">${price}</span>
    </label>
  )
}

export default PopupCard
