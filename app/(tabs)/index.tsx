import {
    Text,
    Image,
    View,
    Platform,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useFetch } from '@/hooks/useFetch';
import { useNumColumns } from '@/hooks/useNumColumns';
import { Anime } from '@/shared/types.types';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';

export default function HomeScreen() {
    const {
        data: animeList,
        loading,
        error,
        refetch,
    } = useFetch<Anime[]>('/anime/home');
    const renderItem = ({ item }: { item: Anime }) => {
        return (
            <Link
                href={{
                    pathname: '/video/[slug]/[id]',
                    params: {
                        slug: item.slug,
                        id: item.id,
                        urlImg: item.urlImg,
                        name: item.name,
                        cap: item.cap,
                    },
                }}
                asChild>
                <TouchableOpacity style={styles.itemContainer}>
                    <Image source={{ uri: item.urlImg }} style={styles.image} />
                    <View style={styles.textContainer}>
                        <Text style={styles.name} numberOfLines={2}>
                            {item.name}
                        </Text>
                        <Text style={styles.cap}>{`Episode ${item.cap}`}</Text>
                    </View>
                </TouchableOpacity>
            </Link>
        );
    };
    if (loading) return <Loading size={64} color='blue' />;
    if (error) return <ErrorMessage reloadMethod={refetch} />;

    return (
        <SafeAreaView style={styles.container}>
            <FlashList
                style={styles.flatlistContainer}
                data={animeList ?? []}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                numColumns={useNumColumns()}
            />
        </SafeAreaView>
    );
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
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
        marginVertical: 4,
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
});
