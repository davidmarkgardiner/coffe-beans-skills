import { useEffect, useRef } from 'react'
import goldenBean from '../assets/golden-bean.svg'

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], .btn, .card-link, input, textarea, select, .cursor-hover-target'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointerQuery = window.matchMedia('(pointer: fine)')

    const enableCursor = () => {
      cursor.style.display = 'block'
      document.body.classList.add('custom-cursor-enabled')
    }

    const disableCursor = () => {
      cursor.style.display = 'none'
      cursor.classList.remove('is-active', 'is-hovering')
      document.body.classList.remove('custom-cursor-enabled')
    }

    if (!finePointerQuery.matches || prefersReducedMotion.matches) {
      disableCursor()
      return
    }

    enableCursor()

    const moveCursor = (event: MouseEvent) => {
      cursor.style.left = `${event.clientX}px`
      cursor.style.top = `${event.clientY}px`
    }

    const handleMouseEnter = () => {
      cursor.classList.add('is-active')
    }

    const handleMouseLeave = () => {
      cursor.classList.remove('is-active')
      cursor.classList.remove('is-hovering')
    }

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as Element | null
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        cursor.classList.add('is-hovering')
      }
    }

    const handleMouseOut = (event: MouseEvent) => {
      const target = event.target as Element | null
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        const related = event.relatedTarget as Element | null
        if (!related || !related.closest(INTERACTIVE_SELECTOR)) {
          cursor.classList.remove('is-hovering')
        }
      }
    }

    window.addEventListener('mousemove', moveCursor, { passive: true })
    window.addEventListener('mouseenter', handleMouseEnter)
    window.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    const handlePointerChange = (event: MediaQueryListEvent) => {
      if (event.matches && !prefersReducedMotion.matches) {
        enableCursor()
      } else {
        disableCursor()
      }
    }

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        disableCursor()
      } else if (finePointerQuery.matches) {
        enableCursor()
      }
    }

    finePointerQuery.addEventListener('change', handlePointerChange)
    prefersReducedMotion.addEventListener('change', handleMotionChange)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      finePointerQuery.removeEventListener('change', handlePointerChange)
      prefersReducedMotion.removeEventListener('change', handleMotionChange)
      disableCursor()
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      style={{ backgroundImage: `url(${goldenBean})` }}
      aria-hidden="true"
    />
  )
}
