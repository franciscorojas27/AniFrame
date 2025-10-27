import { useFavorite } from '@/hooks/useFavorite';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import { useFetch } from '@/hooks/useFetch';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import {
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Pressable,
    Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { AnimeDetails } from '@/shared/types.types';
const THEME = {
    bg: '#0b0b0b',
    card: '#151515',
    cardAlt: '#1a1a1a',
    primary: 'white',
    primaryAlt: '#ff8a7f',
    accent: '#1E90FF',
    accentBg: '#06283D',
    text: '#E0E0E0',
    textDim: '#B0B0B0',
    border: '#333',
    borderAlt: '#444',
    white: '#fff',
};

export default function AnimeDetailsScreen() {
    const { slug } = useLocalSearchParams();
    const { apiBaseUrl } = useAppConfig();
    const router = useRouter();
    const { data, loading, error, refetch } = useFetch<{
        details: AnimeDetails;
        episodes: {
            cap: number;
            watched: boolean;
            last_position_seconds: number;
        }[];
    }>(`/anime/details/${slug}`);
    const goToEpisode = (num: number) =>
        router.push({
            pathname: `/video/[slug]/[id]`,
            params: {
                slug: slug as string,
                id: data?.details.id || ' ',
                cap: num,
                name: data?.details.name,
                imgUrl: data?.details.imgUrl,
            },
        });
    const latestEpisode = data?.details.lastEpisode ?? data?.details.caps ?? 1;
    const [episodes, setEpisodes] = useState(data?.episodes ?? []);

    useEffect(() => {
        if (data?.episodes) setEpisodes(data.episodes);
    }, [data?.episodes]);

    const toggleWatched = async (cap: number, current: boolean) => {
        setEpisodes(prev =>
            prev.map(ep => (ep.cap === cap ? { ...ep, watched: !current } : ep))
        );
        try {
            await fetch(`${apiBaseUrl}/history/toggle/watched`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    anime_id: data!.details.id,
                    cap,
                    watched: !current,
                }),
            });
        } catch (err) {
            console.error(err);
            setEpisodes(prev =>
                prev.map(ep =>
                    ep.cap === cap ? { ...ep, watched: current } : ep
                )
            );
        }
    };

    const { isFavorite, loadingFavorite, toggleFavorite } = useFavorite({
        anime: data?.details ?? null,
        slug: slug as string | undefined,
    });
    return (
        <View style={styles.container}>
            {!loading ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>
                    {/* Error State */}
                    {error && (
                        <ErrorMessage error={error} reloadMethod={refetch} />
                    )}
                    {/* Content */}
                    {!error && data && (
                        <>
                            {/* Hero with backdrop */}
                            {data.details.imgUrl ? (
                                <ImageBackground
                                    source={{ uri: data.details.imgUrl }}
                                    style={styles.hero}
                                    imageStyle={styles.heroBgImage}
                                    blurRadius={
                                        Platform.OS === 'android' ? 8 : 18
                                    }>
                                    <View style={styles.heroOverlay} />
                                    <View style={styles.heroContent}>
                                        <Image
                                            source={{
                                                uri: data.details.imgUrl,
                                            }}
                                            style={styles.poster}
                                            resizeMode='cover'
                                        />
                                        <View style={styles.heroTextCol}>
                                            <Text style={styles.title}>
                                                {data.details.name}
                                            </Text>
                                            <Text
                                                style={styles.description}
                                                numberOfLines={
                                                    Platform.isTV ? 8 : 6
                                                }>
                                                {data.details.description ||
                                                    'Sin descripción disponible.'}
                                            </Text>

                                            {/* Info chips */}
                                            <View style={styles.infoRow}>
                                                <View style={styles.chip}>
                                                    <Text
                                                        style={styles.chipText}>
                                                        Estado:{' '}
                                                        {data.details.status}
                                                    </Text>
                                                </View>
                                                <View style={styles.chip}>
                                                    <Text
                                                        style={styles.chipText}>
                                                        Estreno:{' '}
                                                        {data.details.date}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Actions */}
                                            <View style={styles.actionsRow}>
                                                <Pressable
                                                    style={({ focused }) => [
                                                        styles.primaryBtn,
                                                        focused &&
                                                            styles.primaryBtnFocused,
                                                    ]}
                                                    onPress={() =>
                                                        goToEpisode(
                                                            latestEpisode
                                                        )
                                                    }
                                                    accessibilityRole='button'
                                                    accessibilityLabel='Reproducir último episodio'>
                                                    <Text
                                                        style={
                                                            styles.primaryBtnText
                                                        }>
                                                        ▶
                                                        {data.details
                                                            .lastEpisode
                                                            ? `Continuar ${data.details.lastEpisode}`
                                                            : 'Reproducir último'}
                                                    </Text>
                                                </Pressable>

                                                <Pressable
                                                    style={({ focused }) => [
                                                        styles.secondaryBtn,
                                                        focused &&
                                                            styles.secondaryBtnFocused,
                                                    ]}
                                                    onPress={() =>
                                                        goToEpisode(1)
                                                    }
                                                    accessibilityRole='button'
                                                    accessibilityLabel='Comenzar desde el episodio'>
                                                    <Text
                                                        style={
                                                            styles.secondaryBtnText
                                                        }>
                                                        Episodio 1
                                                    </Text>
                                                    <Ionicons
                                                        name='play-sharp'
                                                        size={24}
                                                        color='white'
                                                    />
                                                </Pressable>
                                                <Pressable
                                                    style={({ focused }) => [
                                                        styles.secondaryBtn,
                                                        focused &&
                                                            styles.secondaryBtnFocused,
                                                    ]}
                                                    disabled={loadingFavorite}
                                                    onPress={toggleFavorite}
                                                    accessibilityRole='button'
                                                    accessibilityLabel='Agregar a favoritos'>
                                                    <Text
                                                        style={
                                                            styles.secondaryBtnText
                                                        }>
                                                        Favoritos
                                                    </Text>
                                                    <Ionicons
                                                        style={{
                                                            marginLeft: 8,
                                                        }}
                                                        name={
                                                            isFavorite
                                                                ? 'star'
                                                                : 'star-outline'
                                                        }
                                                        size={24}
                                                        color={
                                                            isFavorite
                                                                ? 'yellow'
                                                                : 'white'
                                                        }
                                                    />
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                </ImageBackground>
                            ) : (
                                <View style={styles.hero}>
                                    <View style={styles.heroContent}>
                                        <View
                                            style={[
                                                styles.poster,
                                                { backgroundColor: THEME.card },
                                            ]}
                                        />
                                        <View style={styles.heroTextCol}>
                                            <Text style={styles.title}>
                                                {data.details.name}
                                            </Text>
                                            <Text
                                                style={styles.description}
                                                numberOfLines={
                                                    Platform.isTV ? 8 : 6
                                                }>
                                                {data.details.description ||
                                                    'Sin descripción disponible.'}
                                            </Text>
                                            <View style={styles.infoRow}>
                                                <View style={styles.chip}>
                                                    <Text
                                                        style={styles.chipText}>
                                                        Estado:{' '}
                                                        {data.details.status}
                                                    </Text>
                                                </View>
                                                <View style={styles.chip}>
                                                    <Text
                                                        style={styles.chipText}>
                                                        Estreno:{' '}
                                                        {data.details.date}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Genres */}
                            <View
                                style={{
                                    ...styles.sectionCard,
                                    marginBottom: 16,
                                }}>
                                <Text style={styles.sectionTitle}>Géneros</Text>
                                <FlashList
                                    data={data.details.genres}
                                    horizontal
                                    keyExtractor={(item, index) =>
                                        `${item}-${index}`
                                    }
                                    renderItem={({ item, index }) => (
                                        <Pressable
                                            style={({ focused }) => [
                                                styles.genre,
                                                focused && styles.genreFocused,
                                            ]}
                                            accessibilityRole='button'
                                            accessibilityLabel={`Género ${item}`}>
                                            <Text style={styles.genreText}>
                                                {item}
                                            </Text>
                                        </Pressable>
                                    )}
                                    contentContainerStyle={{ paddingRight: 8 }}
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>

                            {/* Episodes grid */}
                            <View style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>
                                    Episodios
                                </Text>
                                <FlashList
                                    data={episodes}
                                    numColumns={1}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => String(item.cap)}
                                    renderItem={({ item }) => (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}>
                                            <Pressable
                                                style={({ focused }) => [
                                                    styles.episode,
                                                    focused &&
                                                        styles.episodeFocused,
                                                ]}
                                                onPress={() =>
                                                    goToEpisode(item.cap)
                                                }
                                                accessibilityRole='button'
                                                accessibilityLabel={`Episodio ${item.cap}`}>
                                                <Text
                                                    style={styles.episodeText}>
                                                    Episodio {item.cap}
                                                </Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={() =>
                                                    toggleWatched(
                                                        item.cap,
                                                        item.watched
                                                    )
                                                }
                                                style={({ focused }) => ({
                                                    backgroundColor: focused
                                                        ? '#ccc'
                                                        : 'transparent',
                                                    padding: 10,
                                                    marginLeft: 10,
                                                    borderRadius: 40,
                                                })}
                                                accessibilityRole='button'
                                                accessibilityLabel={
                                                    item.watched
                                                        ? 'Marcar como no visto'
                                                        : 'Marcar como visto'
                                                }>
                                                <Ionicons
                                                    name={
                                                        item.watched
                                                            ? 'checkmark-done-outline'
                                                            : 'close-outline'
                                                    }
                                                    size={24}
                                                    color={
                                                        item.watched
                                                            ? '#69FD2E'
                                                            : 'red'
                                                    }
                                                />
                                            </Pressable>
                                        </View>
                                    )}
                                    ItemSeparatorComponent={() => (
                                        <View style={{ height: 10 }} />
                                    )}
                                    contentContainerStyle={styles.episodesGrid}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        </>
                    )}
                </ScrollView>
            ) : (
                <Loading size={36} color='blue' />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        paddingHorizontal: Platform.isTV ? 40 : 16,
        paddingTop: 16,
        paddingBottom: 16,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 12,
    },
    backButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: '#1f1f1f',
        borderWidth: 2,
        borderColor: THEME.border,
        shadowColor: '#000',
    },
    backButtonFocused: {
        borderColor: THEME.primary,
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        transform: [{ scale: 1.02 }],
    },
    backText: {
        color: THEME.white,
        fontWeight: '700',
        fontSize: Platform.isTV ? 20 : 14,
    },

    hero: {
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: THEME.cardAlt,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    heroBgImage: {
        opacity: 0.5,
    },
    heroContent: {
        flexDirection: 'row',
        padding: Platform.isTV ? 24 : 16,
        alignItems: 'center',
    },
    poster: {
        width: Platform.isTV ? 280 : 180,
        height: Platform.isTV ? 420 : 270,
        borderRadius: 14,
        borderWidth: 3,
        borderColor: THEME.primary,
        backgroundColor: THEME.card,
    },
    heroTextCol: {
        flex: 1,
        marginLeft: Platform.isTV ? 24 : 16,
    },
    title: {
        fontSize: Platform.isTV ? 36 : 26,
        fontWeight: '900',
        color: 'orange',
        marginBottom: 8,
    },
    description: {
        fontSize: Platform.isTV ? 20 : 16,
        color: THEME.text,
        lineHeight: Platform.isTV ? 30 : 24,
        marginBottom: 12,
        textAlign: 'justify',
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: '#262626',
        borderWidth: 1,
        borderColor: THEME.borderAlt,
    },
    chipText: {
        color: THEME.white,
        fontWeight: '700',
        fontSize: Platform.isTV ? 16 : 13,
    },

    // Actions
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    primaryBtn: {
        paddingVertical: Platform.isTV ? 14 : 10,
        paddingHorizontal: Platform.isTV ? 20 : 16,
        borderRadius: 12,
        backgroundColor: THEME.primary,
    },
    primaryBtnFocused: {
        backgroundColor: THEME.primaryAlt,
        transform: [{ scale: 1.04 }],
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 14,
    },
    primaryBtnText: {
        color: THEME.bg,
        fontWeight: '900',
        fontSize: Platform.isTV ? 20 : 16,
    },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
        paddingVertical: Platform.isTV ? 14 : 10,
        paddingHorizontal: Platform.isTV ? 14 : 16,
        borderRadius: 12,
        backgroundColor: '#262626',
        borderWidth: 2,
        borderColor: THEME.borderAlt,
    },
    secondaryBtnFocused: {
        borderColor: THEME.primary,
        transform: [{ scale: 1.04 }],
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
    },
    secondaryBtnText: {
        color: THEME.white,
        fontWeight: '800',
        fontSize: Platform.isTV ? 20 : 16,
    },

    // Section cards
    sectionCard: {
        padding: Platform.isTV ? 18 : 14,
        backgroundColor: THEME.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.primary,
    },
    sectionTitle: {
        fontSize: Platform.isTV ? 24 : 20,
        fontWeight: '900',
        color: THEME.primary,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    genre: {
        marginRight: 12,
        paddingVertical: Platform.isTV ? 12 : 8,
        paddingHorizontal: Platform.isTV ? 20 : 14,
        borderRadius: 20,
        backgroundColor: '#333',
        borderWidth: 2,
        borderColor: THEME.borderAlt,
    },
    genreFocused: {
        backgroundColor: THEME.primary,
        borderColor: THEME.primary,
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        transform: [{ scale: 1.04 }],
    },
    genreText: {
        color: THEME.white,
        fontWeight: '700',
    },
    episodesGrid: {
        paddingTop: 6,
    },
    episode: {
        flex: 1,
        margin: 4,
        flexDirection: 'row',
        paddingVertical: Platform.isTV ? 12 : 8,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderColor: THEME.borderAlt,
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: Platform.isTV ? 64 : 48,
    },
    episodeFocused: {
        backgroundColor: THEME.accentBg,
        borderColor: THEME.accent,
        shadowColor: THEME.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 14,
        transform: [{ scale: 1.002 }],
    },
    episodeText: {
        color: THEME.accent,
        fontSize: Platform.isTV ? 20 : 16,
        fontWeight: '800',
    },
    heroBackdropSkeleton: {
        height: Platform.isTV ? 480 : 320,
        backgroundColor: '#202020',
    },
    posterSkeleton: {
        width: Platform.isTV ? 280 : 180,
        height: Platform.isTV ? 420 : 270,
        borderRadius: 14,
        backgroundColor: '#232323',
        borderWidth: 3,
        borderColor: '#2a2a2a',
    },
    titleSkeleton: {
        height: 28,
        borderRadius: 8,
        backgroundColor: '#2a2a2a',
        marginBottom: 12,
        width: '70%',
    },
    descSkeleton: {
        height: 18,
        borderRadius: 8,
        backgroundColor: '#2a2a2a',
        marginBottom: 8,
        width: '95%',
    },
    descSkeletonShort: {
        height: 18,
        borderRadius: 8,
        backgroundColor: '#2a2a2a',
        marginBottom: 14,
        width: '60%',
    },
    primaryBtnSkeleton: {
        height: Platform.isTV ? 52 : 44,
        width: Platform.isTV ? 220 : 170,
        borderRadius: 12,
        backgroundColor: '#2a2a2a',
    },
    secondaryBtnSkeleton: {
        height: Platform.isTV ? 52 : 44,
        width: Platform.isTV ? 200 : 150,
        borderRadius: 12,
        backgroundColor: '#2a2a2a',
        marginLeft: 12,
    },
    skeletonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    episodeSkeleton: {
        height: Platform.isTV ? 64 : 48,
        borderRadius: 10,
        backgroundColor: '#232323',
        flexBasis: Platform.isTV ? '15%' : '30%',
        flexGrow: 1,
    },

    // Text feedback
    errorText: {
        color: THEME.text,
        fontSize: Platform.isTV ? 22 : 16,
        marginBottom: 12,
        textAlign: 'center',
    },
});
