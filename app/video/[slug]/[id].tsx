import {
    View,
    StyleSheet,
    ActivityIndicator,
    Text,
    Dimensions,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import { VideoView, VideoSource, useVideoPlayer } from 'expo-video';
import React, { useRef } from 'react';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { Image } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { useSendVideoProgressOnExit } from '@/hooks/useSendVideoProgressOnExit';
export default function VideoScreen() {
    const videoViewRef = useRef<VideoView>(null);
    const { slug, id, urlImg, name, cap } = useLocalSearchParams();
    const {
        data: episodes,
        error: errorEpisodes,
        loading: loadingEpisodes,
    } = useFetch<{ capLink: string; capThumbnail: string }[]>(
        `http://172.16.0.7:3000/anime/episodes/${slug}`
    );
    const {
        data: videoData,
        error: errorVideo,
        loading: loadingVideo,
    } = useFetch<{
        result: { cap: string; foundUrl: string };
        history: { watched: boolean; last_position_seconds: number };
    }>(`http://172.16.0.7:3000/anime/video/${slug}/${cap}/${id}`);

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
            // Platform.isTV ? videoViewRef.current?.enterFullscreen() : null
            player.removeAllListeners('sourceLoad');
        });
    });

    useSendVideoProgressOnExit({
        player,
        apiUrl: 'http://172.16.0.7:3000',
        body: {
            id,
            name,
            urlImg,
            watched: true,
            slug,
        },
        cap,
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
                            urlImg: urlImg,
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
        <SafeAreaView>
            {!loadingVideo ? (
                <ImageBackground
                    resizeMode='stretch'
                    source={{ uri: urlImg as string }}
                    blurRadius={2}
                    style={{ width, height, flex: 1 }}>
                    <View
                        style={{
                            ...StyleSheet.absoluteFillObject,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                        }}
                    />

                    {/* Todo tu contenido encima */}
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
                                source={{ uri: urlImg as string }}
                                style={styles.thumbnail}
                            />
                            <View style={styles.textInfo}>
                                <Text style={styles.name}>{name}</Text>
                                <Text style={styles.cap}>Cap {cap}</Text>
                            </View>
                        </View>
                        <FlashList
                            style={styles.flashList}
                            data={episodes}
                            horizontal
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={1}
                            renderItem={Element}
                        />
                    </View>
                </ImageBackground>
            ) : (
                <ActivityIndicator
                    size='large'
                    color='#00f'
                    style={styles.loader}
                />
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
    loader: {
        flex: 1,
        justifyContent: 'center',
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
