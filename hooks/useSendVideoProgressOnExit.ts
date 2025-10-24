import { useEvent, EventEmitter } from 'expo'
import { useNavigation } from 'expo-router'
import { VideoPlayer } from 'expo-video'
import { useEffect } from 'react'
export const evt = new EventEmitter<{ refreshHistory: () => void }>()

export function useSendVideoProgressOnExit({
  player,
  apiUrl,
  body,
  cap,
}: {
  player: VideoPlayer
  apiUrl: string
  body: any
  cap: string | string[]
}) {
  const navigation = useNavigation()

  useEffect(() => {
    if (!player) return

    const unsubscribe = navigation.addListener('beforeRemove', async () => {
      try {
        evt.emit('refreshHistory')
        const currentTime =
          typeof player.currentTime === 'number' && isFinite(player.currentTime)
            ? Math.round(player.currentTime)
            : 0
        await fetch(`${apiUrl}/history/add/${cap}/${body.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...body,
            seconds: currentTime,
          }),
        })
      } catch (error) {
        console.warn('❌ Error al enviar progreso:', error)
      }
    })

    return () => unsubscribe()
  }, [player, navigation, apiUrl, cap, body])
}
