import {
    View,
    StyleSheet,
    Text,
    Dimensions,
    TouchableOpacity,
    ImageBackground,
    Pressable,
    Image,
} from 'react-native';
import { VideoView, VideoSource, useVideoPlayer } from 'expo-video';
import React, { useMemo, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { useSendVideoProgressOnExit } from '@/hooks/useSendVideoProgressOnExit';
import { useFavorite } from '@/hooks/useFavorite';
import Loading from '@/components/Loading';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function VideoScreen() {
    const videoViewRef = useRef<VideoView>(null);
    const { slug, id, imgUrl, name, cap } = useLocalSearchParams();
    const { data: episodes, loading: loadingEpisodes } = useFetch<
        { capLink: string; capThumbnail: string }[]
    >(`/anime/episodes/${slug}`);
    const { data: videoData, loading: loadingVideo } = useFetch<{
        result: { cap: string; foundUrl: string };
        favorited: boolean;
        history: { watched: boolean; last_position_seconds: number };
    }>(`/anime/video/${slug}/${cap}/${id}`);

    const anime = useMemo(() => {
        if (!videoData) return null;
        return {
            favorited: videoData.favorited,
            id: parseInt(id as string),
            name: name as string,
            imgUrl: imgUrl as string,
        };
    }, [videoData, id, name, imgUrl]);

    const videoSource: VideoSource = {
        uri: videoData?.result.foundUrl || '',
        contentType: videoData?.result.foundUrl.includes('m3u8')
            ? 'hls'
            : 'auto',
        useCaching: true,
    };

    const player = useVideoPlayer(videoSource, player => {
        player.addListener('sourceLoad', () => {
            player.currentTime = videoData?.history.last_position_seconds || 0;
            player.keepScreenOnWhilePlaying = true;
            player.removeAllListeners('sourceLoad');
        });
    });

    useSendVideoProgressOnExit({
        player,
        body: {
            id,
            name,
            imgUrl,
            watched: true,
            slug,
        },
        cap,
    });

    const { isFavorite, loadingFavorite, toggleFavorite } = useFavorite({
        anime,
        slug: slug as string | undefined,
    });

    const Element = ({ item, index }: { item: any; index: number }) => {
        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() =>
                    router.replace({
                        pathname: '/video/[slug]/[id]',
                        params: {
                            slug: slug as string,
                            id: id as string,
                            imgUrl: imgUrl,
                            name: name,
                            cap: index + 1,
                        },
                    })
                }>
                <Image
                    style={styles.imageItem}
                    source={{ uri: item.capThumbnail }}
                />
                <Text style={styles.textItem}>Cap {index + 1}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {loadingVideo ? (
                <Loading size={60} color='blue' />
            ) : (
                <ImageBackground
                    resizeMode='stretch'
                    source={{ uri: imgUrl as string }}
                    blurRadius={2}
                    style={{ width, height, flex: 1 }}>
                    <View
                        style={{
                            ...StyleSheet.absoluteFillObject,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                        }}
                    />
                    <View style={styles.container}>
                        <VideoView
                            ref={videoViewRef}
                            style={styles.video}
                            player={player}
                            fullscreenOptions={{ enable: true }}
                        />
                        <View
                            accessible={false}
                            focusable={false}
                            style={styles.videoInfo}>
                            <Image
                                source={{ uri: imgUrl as string }}
                                style={styles.thumbnail}
                            />
                            <View style={styles.textInfo}>
                                <Text style={styles.name}>{name}</Text>
                                <Text style={styles.cap}>Cap {cap}</Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                <Pressable
                                    disabled={loadingFavorite}
                                    onPress={toggleFavorite}
                                    style={({ focused }) => [
                                        styles.buttonPrimary,
                                        focused && styles.buttonFocused,
                                    ]}>
                                    {({ focused }) => (
                                        <>
                                            <Text
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: focused
                                                        ? 'black'
                                                        : 'white',
                                                    marginLeft: 8,
                                                }}>
                                                Favorite
                                            </Text>
                                            <Ionicons
                                                style={{ marginLeft: 8 }}
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
                                        </>
                                    )}
                                </Pressable>
                                <Pressable
                                    onPress={async () => {
                                        await videoViewRef.current?.enterFullscreen();
                                    }}
                                    style={({ focused }) => [
                                        styles.buttonPrimary,
                                        focused && styles.buttonFocused,
                                    ]}>
                                    {({ focused }) => (
                                        <>
                                            <Text
                                                style={{
                                                    color: focused
                                                        ? 'black'
                                                        : 'white',
                                                    marginLeft: 8,
                                                }}>
                                                Full Screen
                                            </Text>
                                            <MaterialIcons
                                                style={{
                                                    color: focused
                                                        ? 'black'
                                                        : 'white',
                                                    marginLeft: 8,
                                                    marginRight: 8,
                                                }}
                                                name='fullscreen'
                                                size={24}
                                                color={
                                                    focused ? 'black' : 'white'
                                                }
                                            />
                                        </>
                                    )}
                                </Pressable>
                            </View>
                        </View>

                        {loadingEpisodes ? (
                            <Loading size={60} color='blue' />
                        ) : (
                            <FlashList
                                style={styles.flashList}
                                data={episodes}
                                showsHorizontalScrollIndicator={false}
                                horizontal
                                keyExtractor={(item, index) => index.toString()}
                                numColumns={1}
                                renderItem={Element}
                            />
                        )}
                    </View>
                </ImageBackground>
            )}
        </SafeAreaView>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
        padding: 10,
        marginBottom: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 4,
        marginLeft: 20,
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: height * 0.55,
        backgroundColor: '#000',
    },
    videoInfo: {
        flexDirection: 'row',
        marginTop: 8,
        alignItems: 'center',
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 6,
        margin: 12,
        marginRight: 12,
    },
    textInfo: {
        flexShrink: 1,
    },
    buttonPrimary: {
        flexDirection: 'row',
        width: 120,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3C3A3A',
        borderRadius: 4,
        padding: 8,
        marginTop: 8,
        marginLeft: 8,
        marginRight: 8,
    },
    buttonFocused: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cap: {
        color: '#bdbdbd',
        fontSize: 14,
    },
    flashList: {
        marginLeft: 12,
        marginTop: 12,
        height: 100,
    },
    itemContainer: {
        width: 120,
        marginRight: 10,
        alignItems: 'center',
    },
    imageItem: {
        width: '100%',
        height: 80,
        borderRadius: 6,
        marginBottom: 4,
    },
    textItem: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
    },
});
