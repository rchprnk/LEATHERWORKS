import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_VIDEO_ROOT_MARGIN = '700px 0px'
const VIDEO_POSTER_MAX_SIDE = 960

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

    const scale = Math.min(1, VIDEO_POSTER_MAX_SIDE / Math.max(width, height))
    const outputWidth = Math.max(1, Math.round(width * scale))
    const outputHeight = Math.max(1, Math.round(height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = outputWidth
    canvas.height = outputHeight
    const context = canvas.getContext('2d')
    if (!context) return ''

    context.drawImage(video, 0, 0, outputWidth, outputHeight)
    return canvas.toDataURL('image/jpeg', 0.76)
  } catch {
    return ''
  }
}

function waitForVideoEvent(video, eventName, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    const cleanup = () => {
      video.removeEventListener(eventName, handleEvent)
      video.removeEventListener('error', handleError)
      signal?.removeEventListener('abort', handleAbort)
    }
    const handleEvent = () => {
      cleanup()
      resolve()
    }
    const handleError = () => {
      cleanup()
      reject(new Error(`Failed to load video ${eventName}.`))
    }
    const handleAbort = () => {
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }

    video.addEventListener(eventName, handleEvent, { once: true })
    video.addEventListener('error', handleError, { once: true })
    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

async function capturePosterFromSource(src, signal) {
  if (!src || typeof document === 'undefined') return ''

  const video = document.createElement('video')
  video.crossOrigin = 'anonymous'
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.src = src

  try {
    video.load()
    await waitForVideoEvent(video, 'loadedmetadata', signal)
    if (signal?.aborted) return ''

    const targetTime = Number.isFinite(video.duration) && video.duration > 0.2 ? 0.1 : 0
    if (Math.abs(video.currentTime - targetTime) > 0.01) {
      video.currentTime = targetTime
      await waitForVideoEvent(video, 'seeked', signal)
    } else if (video.readyState < 2) {
      await waitForVideoEvent(video, 'loadeddata', signal)
    }

    if (signal?.aborted) return ''
    return captureVideoPoster(video)
  } catch {
    return ''
  } finally {
    video.removeAttribute('src')
    video.load()
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

  useEffect(() => {
    if (!capturePoster || !shouldLoad || !src || poster) return undefined

    const controller = new AbortController()
    capturePosterFromSource(src, controller.signal).then((nextPoster) => {
      if (!controller.signal.aborted && nextPoster) {
        setPosterState({ src, value: nextPoster })
      }
    })

    return () => controller.abort()
  }, [capturePoster, poster, shouldLoad, src])

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
