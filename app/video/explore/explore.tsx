import {
    View,
    StyleSheet,
    Text,
    ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useState, useCallback } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useNumColumns } from '@/hooks/useNumColumns';
import { Anime } from '@/shared/types.types';
import { useAppConfig } from '@/contexts/AppConfigContext';
import SearchBar from '@/components/SideSearch';
import RenderItem from '@/components/RenderItem';

export default function ExploreScreen() {
    // Read URL params first
    const params = useLocalSearchParams();
    // Helpers
    const toArray = (v: undefined | string | string[]) => (v == null ? [] : Array.isArray(v) ? v : [v]);
    const sanitize = (arr: string[]) => arr.map(s => (s ?? '').trim()).filter(Boolean);
    const uniq = (arr: string[]) => Array.from(new Set(arr));
    const parseParamList = (v: undefined | string | string[]) => uniq(sanitize(
        toArray(v)
            .flatMap(s => String(s).split(','))
    ));
    const sameParams = (a: { querySearch: string; genres: string[]; category: string[]; status: string[] }, b: { querySearch: string; genres: string[]; category: string[]; status: string[] }) => (
        a.querySearch === b.querySearch &&
        uniq(a.genres).join(',') === uniq(b.genres).join(',') &&
        uniq(a.category).join(',') === uniq(b.category).join(',') &&
        uniq(a.status).join(',') === uniq(b.status).join(',')
    );
    // Compute initial state from URL so checkboxes start marked
    const initialQuery = typeof params.querySearch === 'string' ? params.querySearch : '';
    const initialFilters = {
        genres: parseParamList(params.genres),
        category: parseParamList(params.category),
        status: parseParamList(params.status),
    };

    const [animeCatalogList, setAnimeCatalogList] = useState<{
        results: Anime[];
        numberPages: number;
    }>({ results: [], numberPages: 0 });
    const [actualPage, setActualPage] = useState(1);
    const [querySearch, setQuerySearch] = useState(initialQuery);
    const [pendingQuery, setPendingQuery] = useState(initialQuery);
    const [filters, setFilters] = useState<{ genres: string[]; category: string[]; status: string[] }>(initialFilters);
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

    type FetchOverrides = { query?: string; filters?: { genres: string[]; category: string[]; status: string[] } };
    const fetchData = useCallback(
        async (page?: number, overrides?: FetchOverrides) => {
            if (loading) return;

            const nextPage = page ?? actualPage;
            if (
                animeCatalogList.numberPages &&
                nextPage > animeCatalogList.numberPages
            )
                return;

            setLoading(true);
            try {
                const params = new URLSearchParams();
                const q = overrides?.query ?? querySearch;
                const f = overrides?.filters ?? filters;
                const sg = uniq(sanitize(f.genres));
                const sc = uniq(sanitize(f.category));
                const ss = uniq(sanitize(f.status));
                params.set('querySearch', q ?? '');
                params.set('page', String(nextPage));
                sg.forEach(g => params.append('genres', g));
                sc.forEach(c => params.append('category', c));
                ss.forEach(s => params.append('status', s));

                const url = `${apiBaseUrl}/anime/search?${params.toString()}`;
                const response = await fetch(url);
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
        [querySearch, filters, actualPage, animeCatalogList.numberPages, loading]
    );

    useEffect(() => {
        // Initial fetch with already-initialized state
        setAnimeCatalogList({ results: [], numberPages: 0 });
        setActualPage(1);
        fetchData(1, { query: querySearch, filters });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <View style={styles.container}>
            {/* Header búsqueda */}
            <SearchBar
                querySearch={pendingQuery}
                setQuerySearch={setPendingQuery}
                selectedGenres={filters.genres}
                selectedCategory={filters.category}
                selectedStatus={filters.status}
                onChangeGenres={(next) => setFilters(f => ({ ...f, genres: Array.from(new Set(next)) }))}
                onChangeCategory={(next) => setFilters(f => ({ ...f, category: Array.from(new Set(next)) }))}
                onChangeStatus={(next) => setFilters(f => ({ ...f, status: Array.from(new Set(next)) }))}
                onSearch={({ query, genres, category, status }) => {
                    const next = {
                        querySearch: query ?? '',
                        genres: uniq(sanitize(genres)),
                        category: uniq(sanitize(category)),
                        status: uniq(sanitize(status)),
                    };
                    const current = {
                        querySearch: typeof params.querySearch === 'string' ? params.querySearch : '',
                        genres: parseParamList(params.genres),
                        category: parseParamList(params.category),
                        status: parseParamList(params.status),
                    };

                    // Primero estado (para que la UI mantenga las marcas)
                    setQuerySearch(next.querySearch);
                    setFilters({ genres: next.genres, category: next.category, status: next.status });
                    setActualPage(1);

                    // Luego URL sin causar remount (setParams)
                    if (!sameParams(current, next)) {
                        router.setParams({
                            querySearch: next.querySearch,
                            genres: next.genres.join(','),
                            category: next.category.join(','),
                            status: next.status.join(','),
                        });
                    }

                    // Y por último la búsqueda
                    fetchData(1, { query: next.querySearch, filters: { genres: next.genres, category: next.category, status: next.status } });
                }}
            />

            {/* Lista de animes */}
            <FlashList
                data={animeCatalogList.results}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <RenderItem
                        item={{
                            imgUrl: item.imgUrl,
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
