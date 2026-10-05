import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

/*
  Figma-компонент Button: Default — Mobile/Tablet 40px, Desktop 50px;
  Hover (есть только у Desktop) — opacity 70%. Tailwind v4 применяет `hover:`
  только на устройствах с настоящим ховером, на тач-экранах его нет.
*/
function Button({ className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`Button flex h-10 cursor-pointer items-center rounded-full bg-primary px-5 text-body text-dark hover:opacity-70 lg:h-12.5 lg:px-7.5 ${className}`}
      {...props}
    />
  )
}

export default Button
