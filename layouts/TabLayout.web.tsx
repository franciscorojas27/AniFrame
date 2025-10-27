import React from 'react';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { Text, StyleSheet, Platform, Pressable, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
const TABS = [
    { name: 'index', label: 'Home', href: '/(tabs)' as const },
    {
        name: 'favorite',
        label: 'Favorite',
        href: '/(tabs)/favorite' as const,
    },
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
    const itemLayouts = React.useRef<Record<string, { x: number; width: number }>>({});
    const [focusKey, setFocusKey] = React.useState<string | null>(null);
    const [hoverKey, setHoverKey] = React.useState<string | null>(null);

    const targetKey = focusKey ?? hoverKey;
    const targetRect = targetKey ? itemLayouts.current[targetKey] : undefined;

    const animLeft = React.useRef(new Animated.Value(0)).current;
    const animWidth = React.useRef(new Animated.Value(0)).current;
    const animOpacity = React.useRef(new Animated.Value(0)).current;

    const handleLayout = (key: string) => (e: any) => {
        const { x, width } = e.nativeEvent.layout || {};
        if (typeof x === 'number' && typeof width === 'number') {
            itemLayouts.current[key] = { x, width };
        }
    };

    const handleFocus = (key: string) => () => setFocusKey(key);
    const handleBlur = (key: string) => () => {
        setFocusKey(prev => (prev === key ? null : prev));
    };
    const handleHoverIn = (key: string) => () => setHoverKey(key);
    const handleHoverOut = (key: string) => () => setHoverKey(prev => (prev === key ? null : prev));

    React.useEffect(() => {
        if (targetRect) {
            const left = Math.max(0, targetRect.x - 12);
            const width = targetRect.width + 24;
            Animated.parallel([
                Animated.timing(animLeft, {
                    toValue: left,
                    duration: 220,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false,
                }),
                Animated.timing(animWidth, {
                    toValue: width,
                    duration: 240,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false,
                }),
                Animated.timing(animOpacity, {
                    toValue: 1,
                    duration: 120,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            Animated.timing(animOpacity, {
                toValue: 0,
                duration: 120,
                easing: Easing.in(Easing.quad),
                useNativeDriver: false,
            }).start();
        }
    }, [targetRect, animLeft, animWidth, animOpacity]);

    return (
        <Tabs>
            {/* Barra de tabs */}
            <TabList style={styles.tabList}>
                {/* Indicador móvil detrás de los botones (Animated para Android TV y Web) */}
                <Animated.View
                    pointerEvents='none'
                    style={[
                        styles.movingIndicator,
                        {
                            left: animLeft,
                            width: animWidth,
                            opacity: animOpacity,
                        },
                    ]}
                />
                <Pressable
                    onPress={() => {
                        router.push('/video/explore/explore');
                        return false;
                    }}
                    onLayout={handleLayout('search')}
                    onFocus={handleFocus('search')}
                    onBlur={handleBlur('search')}
                    onHoverIn={handleHoverIn('search')}
                    onHoverOut={handleHoverOut('search')}
                    style={({ focused, hovered }) => [
                        styles.tabButtonSearch,
                        focused && styles.tabButtonFocused,
                        !focused && styles.tabButtonFlanco,
                        hovered && styles.tabButtonHover,
                    ]}
                    accessibilityLabel={'explore'}>
                    {
                        (({
                            focused,
                            hovered,
                        }: {
                            focused: boolean;
                            hovered: boolean;
                        }) => (
                            <FontAwesome
                                style={[
                                    styles.tabLabel,
                                    focused
                                        ? styles.tabLabelFocused
                                        : styles.tabLabelFlanco,
                                    hovered && !focused
                                        ? styles.tabLabelHover
                                        : undefined,
                                ]}
                                name='search'
                                size={32}
                                color={focused ? '#000' : hovered ? '#e6e6e6' : '#999'}
                            />
                        )) as unknown as React.ReactNode
                    }
                </Pressable>
                {TABS.map(t => (
                    <TabTrigger
                        key={t.name}
                        name={t.name}
                        href={t.href}
                        onLayout={handleLayout(t.name)}
                        onFocus={handleFocus(t.name)}
                        onBlur={handleBlur(t.name)}
                        onHoverIn={handleHoverIn(t.name)}
                        onHoverOut={handleHoverOut(t.name)}
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
                <TabTrigger
                    key={'settings'}
                    name={'settings'}
                    href={'/(tabs)/settings'}
                    onLayout={handleLayout('settings')}
                    onFocus={handleFocus('settings')}
                    onBlur={handleBlur('settings')}
                    onHoverIn={handleHoverIn('settings')}
                    onHoverOut={handleHoverOut('settings')}
                    style={({ focused, hovered }) => [
                        styles.tabButtonSearch,
                        focused && styles.tabButtonFocused,
                        !focused && styles.tabButtonFlanco,
                        hovered && styles.tabButtonHover,
                    ]}
                    accessibilityLabel={'settings'}>
                    {
                        (({
                            focused,
                            hovered,
                        }: {
                            focused: boolean;
                            hovered: boolean;
                        }) => (
                            <MaterialIcons
                                name='settings'
                                size={24}
                                color={focused ? '#000' : hovered ? '#e6e6e6' : '#999'}
                            />
                        )) as unknown as React.ReactNode
                    }
                </TabTrigger>
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
        marginTop: 16,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        backgroundColor: 'transparent',
        position: 'relative',
    },
    movingIndicator: {
        position: 'absolute',
        top: 0,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        opacity: 0,
        transitionProperty: Platform.OS === 'web' ? 'left, width, opacity' : undefined,
        transitionDuration: Platform.OS === 'web' ? '180ms' : undefined,
    },
    tabButtonSearch: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 12,
        marginVertical: 6,
        transitionProperty: Platform.OS === 'web' ? 'all' : undefined,
        transitionDuration: Platform.OS === 'web' ? '150ms' : undefined,
    },
    tabButton: {
        width: 110,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        marginVertical: 6,
        transitionProperty: Platform.OS === 'web' ? 'all' : undefined,
        transitionDuration: Platform.OS === 'web' ? '150ms' : undefined,
    },
    tabButtonFocused: {
        backgroundColor: 'transparent',
        transform: [{ scale: 1.06 }],
    },
    tabButtonFlanco: {
        backgroundColor: 'transparent',
    },
    tabButtonHover: {
        backgroundColor: 'transparent',
        transform: [{ scale: 1.03 }],
    },
    tabLabel: {
        fontSize: 16,
        fontWeight: '600',
        transitionProperty: Platform.OS === 'web' ? 'color' : undefined,
        transitionDuration: Platform.OS === 'web' ? '150ms' : undefined,
    },
    tabLabelFocused: {
        color: '#000',
        fontWeight: '700',
    },
    tabLabelFlanco: {
        color: '#bdbdbd',
        fontWeight: '500',
    },
    tabLabelHover: {
        color: '#f2f2f2',
    },
});
