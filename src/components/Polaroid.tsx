import type { HTMLAttributes, ReactNode } from 'react'
import paper from '../assets/presets-paper.webp'

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  // подпись только для глаз: та же подпись уже читается в другом полароиде
  captionHidden?: boolean
}

/*
  Полароид (Choose-mask в Figma): белая карточка с текстурой бумаги (её 20%
  уже зашиты в альфу файла — отдельная opacity не нужна), внутри — окно фото
  (children) и рукописная подпись Kobzar KS снизу.
  Поля, подпись и тень — одного размера при любом размере фото: в переходе
  Choose → Presets меняется только окно фото. Тень пропорциональна размеру
  карточки в Presets. Положение и поворот задаёт тот, кто вставляет.
*/
function Polaroid({
  className = '',
  children,
  captionHidden = false,
  ...rest
}: Props) {
  return (
    <div
      {...rest}
      className={`Choose-mask flex flex-col gap-2.5 overflow-clip bg-primary p-2.5 shadow-[1rem_1rem_1.3333rem_rgb(1_13_24/0.1)] md:gap-[0.8824rem] md:p-[0.8824rem] md:shadow-[1.4664rem_1.4664rem_1.9552rem_rgb(1_13_24/0.1)] lg:gap-5 lg:p-5 lg:shadow-[1.9428rem_1.9428rem_2.5904rem_rgb(1_13_24/0.1)] ${className}`}
    >
      <img
        src={paper}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className="Choose-mask-paper pointer-events-none absolute inset-0 block size-full max-w-none object-cover"
      />
      {children}
      <p
        aria-hidden={captionHidden || undefined}
        className="Choose-mask-bottom relative flex flex-col items-end font-script leading-none font-normal text-accent"
      >
        <span className="Choose-mask-date self-stretch text-[1.125rem] md:text-[1.6544rem] lg:text-[2.1919rem]">
          April 2026
        </span>{' '}
        <span className="Choose-mask-city-wrap text-[2.673rem] md:text-[3.8603rem] lg:text-[5.1146rem]">
          Italy
        </span>
      </p>
    </div>
  )
}

export default Polaroid
