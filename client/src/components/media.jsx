import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_VIDEO_ROOT_MARGIN = '700px 0px'

function useInViewport(rootMargin = DEFAULT_VIDEO_ROOT_MARGIN) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || isVisible) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => setIsVisible(true))
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      { rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [isVisible, rootMargin])

  return [ref, isVisible]
}

function captureVideoPoster(video) {
  try {
    const width = video.videoWidth || 0
    const height = video.videoHeight || 0
    if (!width || !height) return ''

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return ''

    context.drawImage(video, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', 0.76)
  } catch {
    return ''
  }
}

export function SmartVideo({
  src,
  className,
  style,
  controls = true,
  muted = true,
  playsInline = true,
  preload = 'metadata',
  eager = false,
  rootMargin = DEFAULT_VIDEO_ROOT_MARGIN,
  capturePoster = true,
  ...props
}) {
  const [viewportRef, isVisible] = useInViewport(rootMargin)
  const [posterState, setPosterState] = useState({ src: '', value: '' })
  const shouldLoad = eager || isVisible
  const poster = posterState.src === src ? posterState.value : ''

  const setRefs = useCallback((node) => {
    viewportRef.current = node
  }, [viewportRef])

  const handleLoadedData = useCallback((event) => {
    if (!capturePoster) return
    if (poster) return
    const nextPoster = captureVideoPoster(event.currentTarget)
    if (nextPoster) setPosterState({ src, value: nextPoster })
  }, [capturePoster, poster, src])

  return (
    <video
      ref={setRefs}
      className={className}
      style={style}
      src={shouldLoad ? src : undefined}
      poster={poster || undefined}
      controls={controls}
      muted={muted}
      playsInline={playsInline}
      preload={shouldLoad ? preload : 'none'}
      crossOrigin="anonymous"
      onLoadedData={handleLoadedData}
      {...props}
    />
  )
}
