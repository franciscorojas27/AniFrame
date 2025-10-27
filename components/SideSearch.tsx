import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import CheckBoxCustom from './CheckBoxCustom';
import { FlashList } from '@shopify/flash-list';

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

type SearchBarProps = {
    querySearch: string;
    setQuerySearch: (text: string) => void;
    onSearch: (params: { query: string; genres: string[]; category: string[]; status: string[] }) => void;
    selectedGenres: string[];
    selectedCategory: string[];
    selectedStatus: string[];
    onChangeGenres: (next: string[]) => void;
    onChangeCategory: (next: string[]) => void;
    onChangeStatus: (next: string[]) => void;
};
export default function SearchBar({
    querySearch,
    setQuerySearch,
    onSearch,
    selectedGenres,
    selectedCategory,
    selectedStatus,
    onChangeGenres,
    onChangeCategory,
    onChangeStatus,
}: SearchBarProps) {
    const categories = ['tv-anime', 'pelicula', 'ova', 'especial'];
    const genres = [
        'accion',
        'aventura',
        'ciencia-ficcion',
        'comedia',
        'deportes',
        'drama',
        'fantasia',
        'misterio',
        'recuentos-de-la-vida',
        'romance',
        'seinen',
        'shoujo',
        'shounen',
        'sobrenatural',
        'suspenso',
        'terror',
        'antropomorfico',
        'artes-marciales',
        'carreras',
        'detectives',
        'ecchi',
        'elenco-adulto',
        'escolares',
        'espacial',
        'gore',
        'gourmet',
        'harem',
        'historico',
        'idols-hombre',
        'idols-mujer',
        'infantil',
        'isekai',
        'josei',
        'juegos-estrategia',
        'mahou-shoujo',
        'mecha',
        'militar',
        'mitologia',
        'musica',
        'parodia',
        'psicologico',
        'samurai',
        'shoujo-ai',
        'shounen-ai',
        'superpoderes',
        'vampiros',
    ];
    const status = ['proximamente', 'finalizado', 'emision'];
    const sanitize = (arr: string[]) => arr.map(s => (s ?? '').trim()).filter(Boolean);
    const uniq = (arr: string[]) => Array.from(new Set(arr));
    const genresSelected = selectedGenres ?? [];
    const categorySelected = selectedCategory ?? [];
    const statusSelected = selectedStatus ?? [];
    return (
        <View
            style={[
                styles.sideSearch,
                {
                    paddingHorizontal: THEME.spacing,
                    paddingTop: THEME.spacing,
                },
            ]}>
            <View
                style={[
                    styles.searchContainer,
                    {
                        borderColor: THEME.colors.border,
                        backgroundColor: '#121214',
                        borderRadius: THEME.radius,
                    },
                ]}>
                <Text style={{ color: THEME.colors.muted, marginRight: 8 }}>
                    🔍
                </Text>
                <TextInput
                    placeholder='Search anime...'
                    placeholderTextColor={THEME.colors.muted}
                    value={querySearch}
                    onChangeText={setQuerySearch}
                    // Solo buscar al pulsar botón
                    style={[styles.searchInput, { color: THEME.colors.text }]}
                    returnKeyType='search'
                />
                <TouchableOpacity
                    onPress={() => onSearch({
                        query: (querySearch ?? '').trim(),
                        genres: uniq(sanitize(genresSelected)),
                        category: uniq(sanitize(categorySelected)),
                        status: uniq(sanitize(statusSelected)),
                    })}
                    style={[
                        styles.searchButton,
                        {
                            backgroundColor: THEME.colors.primary,
                            borderRadius: THEME.radius - 2,
                        },
                    ]}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>
            <View
                style={{
                    flex: 1,
                    borderColor: THEME.colors.border,
                    borderWidth: 1,
                    padding: 16,
                    backgroundColor: THEME.colors.background,
                    marginBottom: 16,
                }}>
                <Text
                    style={{
                        fontSize: 14,
                        color: 'white',
                        fontWeight: 'bold',
                    }}>
                    Categories
                </Text>
                <FlashList
                    data={categories}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <CheckBoxCustom
                            label={item}
                            checked={categorySelected.includes(item)}
                            onChange={(next) => {
                                const base = categorySelected;
                                const nextArr = next ? uniq([...base, item]) : base.filter(x => x !== item);
                                onChangeCategory(nextArr);
                            }}
                        />
                    )}
                    keyExtractor={(item) => item}
                    extraData={categorySelected}
                />
                <Text
                    style={{
                        fontSize: 14,
                        color: 'white',
                        fontWeight: 'bold',
                    }}>
                    Genres
                </Text>
                <FlashList
                    data={genres}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <CheckBoxCustom
                            label={item}
                            checked={genresSelected.includes(item)}
                            onChange={(next) => {
                                const base = genresSelected;
                                const nextArr = next ? uniq([...base, item]) : base.filter(x => x !== item);
                                onChangeGenres(nextArr);
                            }}
                        />
                    )}
                    keyExtractor={(item) => item}
                    extraData={genresSelected}
                />
                <Text
                    style={{
                        fontSize: 14,
                        color: 'white',
                        fontWeight: 'bold',
                    }}>
                    Status
                </Text>
                <FlashList
                    data={status}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <CheckBoxCustom
                            label={item}
                            checked={statusSelected.includes(item)}
                            onChange={(next) => {
                                const base = statusSelected;
                                const nextArr = next ? uniq([...base, item]) : base.filter(x => x !== item);
                                onChangeStatus(nextArr);
                            }}
                        />
                    )}
                    keyExtractor={(item) => item}
                    extraData={statusSelected}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: 'black',
    },
    paragraph: {
        fontSize: 15,
    },
    checkbox: {
        margin: 8,
    },
    sideSearch: {
        width: 300,
        // backgroundColor: 'white',
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
