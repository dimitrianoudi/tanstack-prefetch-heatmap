import * as React from 'react'
import registerPrefetchHeatmapPlugin from '@dimano/ts-devtools-plugin-prefetch-heatmap'

export function PrefetchHeatmapPanelHost() {
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!ref.current) return

    const listeners = new Set<(e: unknown) => void>()
    const handler = (evt: Event) => {
      const detail = (evt as CustomEvent).detail
      for (const l of listeners) l(detail)
    }
    window.addEventListener('tsr-prefetch-reporter', handler as EventListener)

    const maybeUnregister: unknown = registerPrefetchHeatmapPlugin({
      registerPanel: ({ mount }) => mount(ref.current!),
      subscribeToEvents: (_type, fn) => {
        listeners.add(fn)
        return () => listeners.delete(fn)
      },
      sendToPage: (msg) => {
        window.dispatchEvent(new CustomEvent('tsr-prefetch-overlay', { detail: msg }))
      },
    })

    return () => {
      window.removeEventListener('tsr-prefetch-reporter', handler as EventListener)
      if (typeof maybeUnregister === 'function') {
        maybeUnregister()
      }
    }
  }, [])

  return <div ref={ref} style={{ height: '100%', width: '100%' }} />
}
