import { useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export const useRefreshPage = ({ refetch }: { refetch: () => void }) => {
    const firstFocus = useRef(true);

    useFocusEffect(
        useCallback(() => {
            if (firstFocus.current) {
                firstFocus.current = false;
                return;
            }
            refetch();
        }, [refetch])
    );
};
