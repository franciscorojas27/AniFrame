import { Slot } from 'expo-router'
import { View, StyleSheet, Platform } from 'react-native'

export default function VideoLayout() {
  return (
    <View style={styles.container}>
      <Slot />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
