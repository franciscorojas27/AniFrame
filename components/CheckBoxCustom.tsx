import { Checkbox } from 'expo-checkbox';
import React, { memo, useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';

function CheckBoxCustomBase({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
    const [focused, setFocused] = useState(false);

    return (
        <Pressable
            style={[styles.section, focused && styles.sectionFocused]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            focusable={true}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onPress={() => onChange(!checked)}
        >
            <View pointerEvents="none" accessible={false}>
                <Checkbox
                    style={[styles.checkbox, focused && styles.checkboxFocused]}
                    value={checked}
                    color={checked ? '#4630EB' : focused ? '#8888ff' : '#444'}
                />
            </View>
            <Text style={styles.paragraph}>{label}</Text>
        </Pressable>
    );
}

const CheckBoxCustom = memo(CheckBoxCustomBase, (prev, next) => prev.checked === next.checked && prev.label === next.label);
export default CheckBoxCustom;

const styles = StyleSheet.create({
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
    },
    sectionFocused: {
        transform: [{ scale: 1.02 }],
    },
    paragraph: {
        fontSize: 14,
        color: '#fff',
    },
    checkbox: {
        margin: 8,
        borderWidth: 2,
        borderColor: '#666',
    },
    checkboxFocused: {
        borderColor: '#8888ff',
        transform: [{ scale: 1.1 }],
    },
});
