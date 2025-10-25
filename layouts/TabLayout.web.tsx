// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = [
    { name: 'index', label: 'Home', href: '/(tabs)/' as const },
    { name: 'explore', label: 'Explore', href: '/(tabs)/explore' as const },
    {
        name: 'activity_history',
        label: 'Activity',
        href: '/(tabs)/activity_history' as const,
    },
    {
        name: 'Schedule',
        label: 'Schedule',
        href: '/(tabs)/schedule' as const,
    },
];

export default function Layout() {
    return (
        <Tabs>
            {/* Barra de tabs */}
            <TabList style={styles.tabList}>
                {TABS.map(t => (
                    <TabTrigger
                        key={t.name}
                        name={t.name}
                        href={t.href}
                        style={({ focused, hovered }) => [
                            styles.tabButton,
                            focused && styles.tabButtonFocused,
                            !focused && styles.tabButtonFlanco,
                            hovered && styles.tabButtonHover,
                        ]}
                        accessibilityLabel={t.label}>
                        {
                            (({
                                focused,
                                hovered,
                            }: {
                                focused: boolean;
                                hovered: boolean;
                            }) => (
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        focused
                                            ? styles.tabLabelFocused
                                            : styles.tabLabelFlanco,
                                        hovered && !focused
                                            ? styles.tabLabelHover
                                            : undefined,
                                    ]}>
                                    {t.label}
                                </Text>
                            )) as unknown as React.ReactNode
                        }
                    </TabTrigger>
                ))}
            </TabList>

            <SafeAreaView style={styles.slotWrap}>
                <TabSlot />
            </SafeAreaView>
        </Tabs>
    );
}

const styles = StyleSheet.create({
    slotWrap: {
        flex: 1,
    },
    tabList: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 70,
        backgroundColor: 'transparent',
    },
    tabButton: {
        width: 115,
        height: 45,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 15,
        transitionProperty: Platform.OS === 'web' ? 'all' : undefined,
        transitionDuration: Platform.OS === 'web' ? '150ms' : undefined,
    },
    tabButtonFocused: {
        backgroundColor: '#ffffff',
        transform: [{ scale: 1.1 }],
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    tabButtonFlanco: {
        backgroundColor: 'transparent',
    },
    tabButtonHover: {
        backgroundColor: '#1c1c28',
        transform: [{ scale: 1.05 }],
    },
    tabLabel: {
        fontSize: 18,
        fontWeight: '600',
        transitionProperty: Platform.OS === 'web' ? 'color' : undefined,
        transitionDuration: Platform.OS === 'web' ? '150ms' : undefined,
    },
    tabLabelFocused: {
        color: 'black',
        fontWeight: '700',
    },
    tabLabelFlanco: {
        color: '#ccc',
        fontWeight: '500',
    },
    tabLabelHover: {
        color: '#ffffff',
    },
});
