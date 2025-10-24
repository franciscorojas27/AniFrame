import {
  Text,
  Image,
  View,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, usePathname } from 'expo-router'
import { FlashList } from '@shopify/flash-list'

export default function HomeScreen() {
  const pathname = usePathname()
  const isFocused = pathname === '/'
  const [animeList, setAnimeList] = useState<
    { id: string; cap: number; name: string; url: string; urlImg: string }[]
  >([])

  useEffect(() => {
    fetch('http://172.16.0.7:3000/anime/home')
      .then((res) => res.json())
      .then((data) => setAnimeList(data))
  }, [])

  const sortedAnimeList = useMemo(() => {
    const list = [...animeList]
    list.sort((a, b) => {
      const aCap = a.cap
      const bCap = b.cap
      if (!Number.isNaN(aCap) && !Number.isNaN(bCap)) {
        const byCap = bCap - aCap
        if (byCap !== 0) return byCap
      }
      return a.name.localeCompare(b.name)
    })
    return list
  }, [animeList])

  const columns = Platform.isTV ? 4 : 2

  const renderItem = ({
    item,
    index,
  }: {
    item: { id: string; cap: string; name: string; url: string; urlImg: string }
    index: number
  }) => {
    const slug = new URL(item.url).pathname.split('/')[2].toString()

    return (
      <Link
        screenReaderFocusable={isFocused}
        importantForAccessibility={isFocused ? 'auto' : 'no-hide-descendants'}
        accessible={isFocused}
        href={{
          pathname: '/video/[slug]/[id]',
          params: {
            slug,
            id: item.id,
            urlImg: item.urlImg,
            name: item.name,
            cap: item.cap,
          },
        }}
        asChild
      >
        <TouchableOpacity
          focusable={isFocused}
          hasTVPreferredFocus={isFocused && index === 0}
          style={styles.itemContainer}
        >
          <Image source={{ uri: item.urlImg }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.cap}>{`Episode ${item.cap}`}</Text>
          </View>
        </TouchableOpacity>
      </Link>
    )
  }

  return (
    <SafeAreaView
      style={styles.container}
      focusable={false}
      importantForAccessibility={isFocused ? 'auto' : 'no-hide-descendants'}
    >
      {animeList.length > 0 ? (
        <FlashList
          style={styles.flatlistContainer}
          data={sortedAnimeList.map((item) => ({
            ...item,
            id: item.id.toString(),
            cap: item.cap.toString(),
          }))}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={columns}
          contentContainerStyle={styles.flatListContent}
          ListHeaderComponent={
            <View style={styles.headerView}>
              <Text style={styles.headerText}>Home</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.placeholder}>
          <ActivityIndicator size='large' color='#0000ff' />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flatlistContainer: {
    flex: 1,
    marginBottom: Platform.isTV ? 0 : 40,
  },
  headerView: {
    alignItems: 'center',
    marginVertical: 6,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff0000ff',
    padding: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {},
  itemContainer: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#141414',
    overflow: 'hidden',
    alignItems: 'center',
    padding: 4,
  },
  image: {
    width: '100%',
    height: 120,
    aspectRatio: 16 / 9,
    borderRadius: 6,
    marginBottom: 4,
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  cap: {
    fontSize: 11,
    color: '#bdbdbd',
  },
})
