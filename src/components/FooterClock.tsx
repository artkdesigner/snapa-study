import { useEffect, useState } from 'react'

// Время там, где адрес в футере (807 S Los Angeles St), в формате макета:
// «09:49:47 AM».
const FORMAT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})

// Строка собирается из частей сама: браузеры на новых ICU ставят перед AM/PM
// узкий неразрывный пробел (U+202F), в макете — обычный.
function formatTime(date: Date) {
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    FORMAT.formatToParts(date).find((p) => p.type === type)?.value ?? ''
  return `${part('hour')}:${part('minute')}:${part('second')} ${part('dayPeriod')}`
}

/*
  Живые часы в Footer-location: тикают раз в секунду, в начале каждой
  секунды (таймер выравнивается по системным часам, не копит сдвиг).
  Отдельный компонент — каждую секунду перерисовывается только строка
  времени, а не весь футер.
  Цифры в General Sans разной ширины (моноширинных нет), поэтому место
  под время — по самому широкому варианту: невидимые «00:00:00 AM/PM» в
  той же ячейке сетки («0» — самая широкая цифра). Иначе адрес справа
  (Desktop) дёргался бы каждую секунду.
*/
const WIDEST = ['00:00:00 AM', '00:00:00 PM']

function FooterClock({ className = '' }: { className?: string }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: number
    const tick = () => {
      setNow(new Date())
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000))
    }
    timer = window.setTimeout(tick, 1000 - (Date.now() % 1000))
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <span className={`inline-grid ${className}`}>
      <time dateTime={now.toISOString()} className="[grid-area:1/1]">
        {formatTime(now)}
      </time>
      {WIDEST.map((text) => (
        <span
          key={text}
          aria-hidden="true"
          className="invisible [grid-area:1/1]"
        >
          {text}
        </span>
      ))}
    </span>
  )
}

export default FooterClock
