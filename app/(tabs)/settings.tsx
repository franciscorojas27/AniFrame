import { useAppConfig } from '@/contexts/AppConfigContext';
import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';

export default function ConfigScreen() {
    const { apiBaseUrl, setApiBaseUrl } = useAppConfig();
    const [tempUrl, setTempUrl] = useState(apiBaseUrl);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (saved) {
            timer = setTimeout(() => setSaved(false), 2000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [saved]);

    const handleSave = () => {
        let sanitized = tempUrl;
        if (!/^https?:\/\/$/.test(tempUrl)) {
            sanitized = tempUrl.replace(/\/+$/, '');
        }
        setApiBaseUrl(sanitized);
        setTempUrl(sanitized);
        setSaved(true);
        Keyboard.dismiss();
    };
    return (
        <View style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.header}>Ajustes</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>API Base URL</Text>
                    <TextInput
                        style={styles.input}
                        value={tempUrl}
                        onChangeText={setTempUrl}
                        placeholder='http://...'
                        placeholderTextColor='#9CA3AF'
                        autoCapitalize='none'
                        autoCorrect={false}
                        keyboardType='url'
                        returnKeyType='done'
                    />

                    <TouchableOpacity
                        activeOpacity={0.4}
                        style={styles.button}
                        onPress={handleSave}>
                        <Text style={styles.buttonText}>Guardar</Text>
                    </TouchableOpacity>

                    {saved && (
                        <Text style={styles.saved}>Guardado correctamente</Text>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    inner: {
        width: '100%',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: '700',
        color: '#E6EEF7',
        marginBottom: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#0F1724',
        padding: 18,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        color: '#CBD5E1',
        fontWeight: '600',
    },
    input: {
        color: '#E6EEF7',
        backgroundColor: '#081226',
        borderWidth: 1,
        borderColor: '#1F2937',
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 16,
        borderRadius: 8,
        fontSize: 14,
    },
    button: {
        backgroundColor: '#2563EB',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
    saved: {
        marginTop: 12,
        color: '#34D399',
        fontWeight: '600',
        textAlign: 'center',
    },
});
