import {
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, usePathname } from 'expo-router'

export interface AnimeSearchEntity {
  id: number
  name: string
  url: string
  urlImg: string
}

export default function ExploreScreen() {
  const pathname = usePathname()
  const isFocused = pathname === '/explore'
  const [animeCatalogList, setAnimeCatalogList] = useState<{
    results: AnimeSearchEntity[]
    numberPages: number
  }>({ results: [], numberPages: 0 })
  const [actualPage, setActualPage] = useState(1)
  const [querySearch, setQuerySearch] = useState('')
  const [loading, setLoading] = useState(false)

  const THEME = {
    colors: {
      background: '#0B0B0F',
      text: '#EAEAEA',
      muted: '#9AA0A6',
      primary: '#00A3FF',
      border: '#2A2A2A',
      card: '#191919',
    },
    spacing: 12,
    radius: 10,
  }

  const SCREEN_WIDTH = Dimensions.get('window').width
  const NUM_COLUMNS = Platform.isTV
    ? 4
    : SCREEN_WIDTH >= 900
      ? 2
      : SCREEN_WIDTH >= 768
        ? 4
        : SCREEN_WIDTH >= 600
          ? 3
          : 2
  const CARD_GAP = 10
  const H_PADDING = THEME.spacing * 2
  const CARD_WIDTH = Math.floor(
    (SCREEN_WIDTH - H_PADDING - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS,
  )

  const TITLE_LINES = 2
  const TITLE_FONT_SIZE = 13
  const TITLE_LINE_HEIGHT = 18
  const TITLE_VERTICAL_PADDING = 8
  const TITLE_CONTAINER_HEIGHT =
    TITLE_LINES * TITLE_LINE_HEIGHT + TITLE_VERTICAL_PADDING * 2

  const fetchData = useCallback(
    async (page?: number) => {
      if (loading) return

      const nextPage = page ?? actualPage
      if (
        animeCatalogList.numberPages &&
        nextPage > animeCatalogList.numberPages
      )
        return

      setLoading(true)
      try {
        const response = await fetch(
          `http://172.16.0.7:3000/anime/search?querySearch=${encodeURIComponent(querySearch)}&page=${nextPage}`,
        )
        const dataNew: {
          results: AnimeSearchEntity[]
          numberPages: number
        } = await response.json()

        setAnimeCatalogList((prev) => {
          const existingIds = new Set(prev.results.map((r) => r.id))
          const filteredNew = dataNew.results.filter(
            (r) => !existingIds.has(r.id),
          )
          return {
            results:
              nextPage === 1 ? filteredNew : [...prev.results, ...filteredNew],
            numberPages: dataNew.numberPages,
          }
        })

        setActualPage(nextPage + 1)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    },
    [querySearch, actualPage, animeCatalogList.numberPages, loading],
  )

  useEffect(() => {
    setAnimeCatalogList({ results: [], numberPages: 0 })
    setActualPage(1)
    fetchData(1)
  }, [querySearch])
  const renderItem = ({ item }: { item: AnimeSearchEntity }) => {
    return (
      <Link
        href={{
          pathname: '/video/[slug]/details',
          params: {
            slug: new URL(item.url).pathname.split('/')[2].toString(),
          },
        }}
        style={[styles.card, { width: CARD_WIDTH }]}
        asChild
      >
        <TouchableOpacity activeOpacity={0.4}>
          {/* Poster */}
          <Image
            source={{ uri: item.urlImg }}
            style={styles.posterImage}
            onError={(e) => console.log(e)}
          />

          {/* Title */}
          <View
            style={[
              styles.titleContainer,
              {
                height: TITLE_CONTAINER_HEIGHT,
                paddingVertical: TITLE_VERTICAL_PADDING,
              },
            ]}
          >
            <Text
              style={[
                styles.itemText,
                {
                  fontSize: TITLE_FONT_SIZE,
                  lineHeight: TITLE_LINE_HEIGHT,
                },
              ]}
              numberOfLines={TITLE_LINES}
              ellipsizeMode='tail'
            >
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME.colors.background }]}
    >
      {/* Header búsqueda */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: THEME.spacing,
            paddingTop: THEME.spacing,
          },
        ]}
      >
        <View
          style={[
            styles.searchContainer,
            {
              borderColor: THEME.colors.border,
              backgroundColor: '#121214',
              borderRadius: THEME.radius,
            },
          ]}
        >
          <Text style={{ color: THEME.colors.muted, marginRight: 8 }}>🔍</Text>
          <TextInput
            placeholder='Search anime...'
            placeholderTextColor={THEME.colors.muted}
            value={querySearch}
            onChangeText={setQuerySearch}
            onSubmitEditing={() => {
              setAnimeCatalogList({
                results: [],
                numberPages: 0,
              })
              setActualPage(1)
              fetchData(1)
            }}
            style={[styles.searchInput, { color: THEME.colors.text }]}
            returnKeyType='search'
          />
          <TouchableOpacity
            onPress={() => {
              setAnimeCatalogList({
                results: [],
                numberPages: 0,
              })
              setActualPage(1)
              fetchData(1)
            }}
            style={[
              styles.searchButton,
              {
                backgroundColor: THEME.colors.primary,
                borderRadius: THEME.radius - 2,
              },
            ]}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de animes */}
      <FlashList
        data={animeCatalogList.results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        directionalLockEnabled={true}
        contentContainerStyle={[
          styles.gridContent,
          {
            paddingHorizontal: THEME.spacing,
            paddingBottom: THEME.spacing,
          },
        ]}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        onEndReached={() => fetchData()}
        ListEmptyComponent={
          !loading && querySearch.length > 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: THEME.colors.muted }}>
                No results found
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size='large' color={THEME.colors.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
  },
  searchButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  searchButtonText: {
    color: '#0B0B0B',
    fontWeight: '600',
  },
  gridContent: {
    paddingTop: 8,
  },
  card: {
    margin: 5, // gap between cards
    backgroundColor: '#191919',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  posterImage: {
    width: '100%',
    aspectRatio: 2 / 3,
    resizeMode: 'cover',
    backgroundColor: '#ccc',
  },
  titleContainer: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  itemText: {
    color: '#EAEAEA',
    textAlign: 'center',
  },
  footerLoading: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
})
