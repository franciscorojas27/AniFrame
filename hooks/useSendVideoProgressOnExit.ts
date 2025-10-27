import { useAppConfig } from '@/contexts/AppConfigContext';
import { useEvent, EventEmitter } from 'expo';
import { useNavigation } from 'expo-router';
import { VideoPlayer } from 'expo-video';
import { useEffect } from 'react';
export const evt = new EventEmitter<{
    refreshHistory: () => void;
    favorite: () => void;
}>();

export function useSendVideoProgressOnExit({
    player,
    body,
    cap,
}: {
    player: VideoPlayer;
    body: any;
    cap: string | string[];
}) {
    const navigation = useNavigation();
    const { apiBaseUrl } = useAppConfig();
    useEffect(() => {
        if (!player) return;

        const unsubscribe = navigation.addListener('beforeRemove', async () => {
            try {
                const currentTime =
                    typeof player.currentTime === 'number' &&
                    isFinite(player.currentTime)
                        ? Math.round(player.currentTime)
                        : 0;
                await fetch(`${apiBaseUrl}/history/add/${cap}/${body.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...body,
                        seconds: currentTime,
                    }),
                });
                evt.emit('refreshHistory');
            } catch (error) {
                console.warn('❌ Error al enviar progreso:', error);
            }
        });

        return () => unsubscribe();
    }, [player, navigation, cap, body]);
}
