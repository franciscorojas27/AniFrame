import {
    View,
    StyleSheet,
    Text,
    ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useState, useCallback } from 'react';
import { useNumColumns } from '@/hooks/useNumColumns';
import { Anime } from '@/shared/types.types';
import { useAppConfig } from '@/contexts/AppConfigContext';
import SearchBar from '@/components/SideSearch';
import RenderItem from '@/components/RenderItem';

export default function ExploreScreen() {
    const [animeCatalogList, setAnimeCatalogList] = useState<{
        results: Anime[];
        numberPages: number;
    }>({ results: [], numberPages: 0 });
    const [actualPage, setActualPage] = useState(1);
    const [querySearch, setQuerySearch] = useState('');
    const [loading, setLoading] = useState(false);
    const { apiBaseUrl } = useAppConfig();
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
    };

    const fetchData = useCallback(
        async (page?: number) => {
            if (loading) return;

            const nextPage = page ?? actualPage;
            if (
                animeCatalogList.numberPages &&
                nextPage > animeCatalogList.numberPages
            )
                return;

            setLoading(true);
            try {
                const response = await fetch(
                    `${apiBaseUrl}/anime/search?querySearch=${encodeURIComponent(querySearch)}&page=${nextPage}`
                );
                const dataNew: {
                    results: Anime[];
                    numberPages: number;
                } = await response.json();

                setAnimeCatalogList(prev => {
                    const existingIds = new Set(prev.results.map(r => r.id));
                    const filteredNew = dataNew.results.filter(
                        r => !existingIds.has(r.id)
                    );
                    return {
                        results:
                            nextPage === 1
                                ? filteredNew
                                : [...prev.results, ...filteredNew],
                        numberPages: dataNew.numberPages,
                    };
                });

                setActualPage(nextPage + 1);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [querySearch, actualPage, animeCatalogList.numberPages, loading]
    );

    useEffect(() => {
        setAnimeCatalogList({ results: [], numberPages: 0 });
        setActualPage(1);
        fetchData(1);
    }, [querySearch]);

    return (
        <View style={styles.container}>
            {/* Header búsqueda */}
            <SearchBar
                querySearch={querySearch}
                setQuerySearch={setQuerySearch}
                onSearch={() => {
                    setAnimeCatalogList({ results: [], numberPages: 0 });
                    setActualPage(1);
                    fetchData(1);
                }}
            />

            {/* Lista de animes */}
            <FlashList
                data={animeCatalogList.results}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <RenderItem
                        item={{
                            imgUrl: item.urlImg,
                            name: item.name,
                            slug: item.slug,
                        }}
                    />
                )}
                directionalLockEnabled={true}
                numColumns={useNumColumns()}
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
                            <ActivityIndicator
                                size='large'
                                color={THEME.colors.primary}
                            />
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
    },
    sideSearch: {
        width: 300,
        backgroundColor: 'white',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
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
        margin: 5,
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
});
