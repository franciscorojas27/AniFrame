import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppConfigType = {
    apiBaseUrl: string;
    setApiBaseUrl: (url: string) => void;
    reloadApp: () => void;
    reloadKey: number;
};

const AppConfigContext = createContext<AppConfigType | null>(null);

export function AppConfigProvider({ children }: { children: ReactNode }) {
    const [apiBaseUrl, setApiBaseUrlState] = useState<string>(
        'http://172.16.0.7:3000'
    );
    const [reloadKey, setReloadKey] = useState<number>(0);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const storedUrl = await AsyncStorage.getItem('apiBaseUrl');
                if (mounted && storedUrl) {
                    setApiBaseUrlState(storedUrl);
                }
            } catch (error) {
                console.warn(
                    'Failed to load apiBaseUrl from AsyncStorage',
                    error
                );
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const setApiBaseUrl = (url: string) => {
        setApiBaseUrlState(url);
        AsyncStorage.setItem('apiBaseUrl', url).catch(error =>
            console.warn('Failed to save apiBaseUrl to AsyncStorage', error)
        );
        setReloadKey(prev => prev + 1);
    };

    const reloadApp = () => setReloadKey(prev => prev + 1);

    return React.createElement(
        AppConfigContext.Provider,
        { value: { apiBaseUrl, setApiBaseUrl, reloadApp, reloadKey } },
        children
    );
}

export const useAppConfig = (): AppConfigType => {
    const context = useContext(AppConfigContext);
    if (!context)
        throw new Error('useAppConfig must be used within AppConfigProvider');
    return context;
};
