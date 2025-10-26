import { View, Pressable, Platform, Text, StyleSheet } from 'react-native';

const THEME = {
    bg: '#0b0b0b',
    card: '#151515',
    cardAlt: '#1a1a1a',
    primary: '#FF6F61',
    primaryAlt: '#ff8a7f',
    accent: '#1E90FF',
    accentBg: '#06283D',
    text: '#E0E0E0',
    textDim: '#B0B0B0',
    border: '#333',
    borderAlt: '#444',
    white: '#fff',
};

export default function ErrorMessage({
    reloadMethod,
}: {
    reloadMethod: () => void;
}) {
    return (
        <View style={styles.sectionCard}>
            <Text style={styles.errorText}>{'An error occurred'}</Text>
            <Pressable
                style={({ focused }) => [
                    styles.primaryBtn,
                    focused && styles.primaryBtnFocused,
                ]}
                onPress={reloadMethod}
                accessibilityRole='button'
                accessibilityLabel='Reintentar'>
                <Text style={styles.primaryBtnText}>Reintentar</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: THEME.bg,
        paddingHorizontal: Platform.isTV ? 40 : 16,
        paddingTop: 16,
        paddingBottom: 16,
    },
    primaryBtn: {
        paddingVertical: Platform.isTV ? 14 : 10,
        paddingHorizontal: Platform.isTV ? 20 : 16,
        borderRadius: 12,
        backgroundColor: THEME.primary,
    },
    primaryBtnFocused: {
        backgroundColor: THEME.primaryAlt,
        transform: [{ scale: 1.04 }],
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 14,
    },
    primaryBtnText: {
        color: THEME.bg,
        fontWeight: '900',
        fontSize: Platform.isTV ? 20 : 16,
    },
    sectionCard: {
        padding: Platform.isTV ? 18 : 14,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.primary,
    },
    errorText: {
        color: THEME.text,
        fontSize: Platform.isTV ? 22 : 16,
        marginBottom: 12,
        textAlign: 'center',
    },
});
