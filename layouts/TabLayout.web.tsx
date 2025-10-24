// app/(tabs)/_layout.tsx
import React from 'react'
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui'
import { View, Text, StyleSheet, Platform } from 'react-native'

const TABS = [
  { name: 'index', label: 'Home', href: '/(tabs)/' as const },
  { name: 'explore', label: 'Explore', href: '/(tabs)/explore' as const },
  {
    name: 'activity_history',
    label: 'Activity',
    href: '/(tabs)/activity_history' as const,
  },
]

export default function Layout() {
  return (
    <Tabs>
      {/* Barra de tabs */}
      <TabList style={styles.tabList}>
        {TABS.map((t) => (
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
            accessibilityLabel={t.label}
          >
            {({ focused, hovered }) => (
              <Text
                style={[
                  styles.tabLabel,
                  focused ? styles.tabLabelFocused : styles.tabLabelFlanco,
                  hovered && !focused ? styles.tabLabelHover : undefined,
                ]}
              >
                {t.label}
              </Text>
            )}
          </TabTrigger>
        ))}
      </TabList>

      {/* Slot para pantalla activa */}
      <View style={styles.slotWrap}>
        <TabSlot />
      </View>
    </Tabs>
  )
}

const styles = StyleSheet.create({
  slotWrap: {
    flex: 1,
    backgroundColor: '#060270', 
  },
  tabList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 90,
    paddingHorizontal: 16,
    backgroundColor: '#0b0b0f', 
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  tabButton: {
    width: 250, 
    height: 55, 
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
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
    borderWidth: 2,
    borderColor: '#444',
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
    color: '#060270', 
    fontWeight: '700',
  },
  tabLabelFlanco: {
    color: '#ccc',
    fontWeight: '500',
  },
  tabLabelHover: {
    color: '#ffffff', // texto en hover
  },
})
