import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import { useFetch } from '@/hooks/useFetch';
import { evt } from '@/hooks/useSendVideoProgressOnExit';
import { FlashList } from '@shopify/flash-list';
import { useEventListener } from 'expo';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

type HistoryItem = {
    anime_id: number;
    name: string;
    slug: string;
    img_url: string;
    last_episode: number;
};

export default function ActivityHistoryScreen() {
    const { data, loading, error, refetch } =
        useFetch<HistoryItem[]>('/history');
    console.log(data);

    useEventListener(evt, 'refreshHistory', () => {
        refetch();
    });
    function renderItem({ item }: { item: HistoryItem }) {
        return (
            <TouchableOpacity
                onPress={() => {
                    router.push({
                        pathname: `/video/[slug]/[id]`,
                        params: {
                            slug: item.slug,
                            id: item.anime_id || ' ',
                            cap: item.last_episode,
                            name: item.name,
                            urlImg: item.img_url,
                        },
                    });
                }}
                style={styles.itemContainer}>
                <Image
                    source={{ uri: item.img_url }}
                    style={styles.imageItem}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.subtitle}>
                        Capítulo {item.last_episode}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    if (loading) return <Loading size={64} color='blue' />;
    if (error) return <ErrorMessage reloadMethod={refetch} />;

    return (
        <View style={styles.container}>
            <FlashList
                data={data}
                keyExtractor={item => item.anime_id.toString()}
                initialScrollIndex={0}
                persistentScrollbar={false}
                directionalLockEnabled={true}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 8,
    },

    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 12,
        marginVertical: 6,
        backgroundColor: '#3A3A3A',
        borderRadius: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    imageItem: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    textContainer: {
        marginLeft: 12,
    },
    title: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        color: '#cccccc',
        fontSize: 14,
        marginTop: 4,
    },
});
