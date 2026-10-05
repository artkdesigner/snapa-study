import { useCallback, useRef, useState } from 'react'
import Hero from '../components/Hero'
import Preloader from '../components/Preloader'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Home() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const [preloading, setPreloading] = useState(() => !prefersReducedMotion())
  const handlePreloaderDone = useCallback(() => setPreloading(false), [])

  return (
    <>
      {preloading && (
        <Preloader targetRef={heroTitleRef} onDone={handlePreloaderDone} />
      )}
      <main>
        <Hero titleRef={heroTitleRef} />
      </main>
    </>
  )
}

export default Home
