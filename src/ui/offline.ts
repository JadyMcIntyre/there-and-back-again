import { useEffect, useState } from 'react'

export function useOfflineStatus() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
    const worker = navigator.serviceWorker
    let channel: MessageChannel | undefined
    function check() {
      channel?.port1.close()
      if (!worker.controller) return
      channel = new MessageChannel()
      channel.port1.onmessage = ({ data }) => setReady(data === 'atlas-cached')
      worker.controller.postMessage('atlas-offline-status', [channel.port2])
    }
    check()
    worker.addEventListener('controllerchange', check)
    return () => {
      worker.removeEventListener('controllerchange', check)
      channel?.port1.close()
    }
  }, [])
  return !import.meta.env.PROD ? 'Offline caching is available in the production preview.'
    : ready ? 'Ready offline on this device' : 'Preparing offline content…'
}
