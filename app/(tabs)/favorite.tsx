import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import { useFetch } from '@/hooks/useFetch';
import { useNumColumns } from '@/hooks/useNumColumns';
import { FlashList } from '@shopify/flash-list';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
    Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppConfig } from '@/contexts/AppConfigContext';

type FavoriteItem = {
    id: number;
    name: string;
    slug: string;
    imgUrl: string;
};

export default function FavoriteScreen() {
    const { data, loading, error, refetch } =
        useFetch<FavoriteItem[]>(`/favorite`);
    console.log(data);

    const [modoEliminar, setModoEliminar] = useState(false);
    const { apiBaseUrl } = useAppConfig();
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    if (loading) return <Loading size={64} color='blue' />;
    if (error) return <ErrorMessage reloadMethod={refetch} />;

    const handleDelete = async (anime_id: number) => {
        try {
            const res = await fetch(`${apiBaseUrl}/favorite/${anime_id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                refetch();
            } else {
                Alert.alert('Error', 'No se pudo eliminar el favorito.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const Element = ({ item }: { item: FavoriteItem }) => {
        if (modoEliminar) {
            return (
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.element}
                    onPress={() => handleDelete(item.id)}>
                    <Image
                        style={styles.itemImg}
                        source={{ uri: item.imgUrl }}
                    />
                    <View style={styles.deleteOverlay}>
                        <MaterialIcons
                            name='delete-forever'
                            size={24}
                            color='white'
                        />
                    </View>
                    <Text numberOfLines={1} style={styles.text}>
                        {item.name}
                    </Text>
                </TouchableOpacity>
            );
        }

        return (
            <Link
                href={{
                    pathname: '/video/[slug]/details',
                    params: { slug: item.slug },
                }}
                asChild>
                <TouchableOpacity activeOpacity={0.6} style={styles.element}>
                    <Image
                        style={styles.itemImg}
                        source={{ uri: item.imgUrl }}
                    />
                    <Text numberOfLines={1} style={styles.text}>
                        {item.name}
                    </Text>
                </TouchableOpacity>
            </Link>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.switchContainer}>
                <Pressable
                    onPress={() => {
                        setModoEliminar(!modoEliminar);
                    }}>
                    <Text style={styles.switchLabel}>
                        {' '}
                        {modoEliminar
                            ? 'Modo eliminar activo'
                            : 'Modo eliminar desactivado'}
                    </Text>
                </Pressable>

                <Switch
                    value={modoEliminar}
                    onValueChange={setModoEliminar}
                    trackColor={{ false: '#555', true: '#ff3b30' }}
                    thumbColor={modoEliminar ? '#fff' : '#ccc'}
                />
            </View>

            <FlashList
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item.id.toString()}
                data={data}
                numColumns={useNumColumns()}
                renderItem={Element}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        backgroundColor: '#202022',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    switchLabel: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    text: {
        fontSize: 12,
        fontWeight: '700',
        color: 'white',
        marginTop: 4,
        textAlign: 'center',
        width: '100%',
    },
    itemImg: {
        width: '100%',
        height: 190,
        aspectRatio: 1.5,
        borderRadius: 8,
        marginBottom: 4,
    },
    element: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        margin: 6,
        paddingBottom: 4,
        borderRadius: 8,
        backgroundColor: '#202022',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    deleteOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 59, 48, 0.8)',
        borderRadius: 50,
        padding: 5,
    },
});
