import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import { useFetch } from '@/hooks/useFetch';
import { useNumColumns } from '@/hooks/useNumColumns';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, Pressable } from 'react-native';
import { useAppConfig } from '@/contexts/AppConfigContext';
import RenderItem from '@/components/RenderItem';
import { FavoriteItem } from '@/shared/types.types';
import RenderItemDelete from '@/components/RenderItemDelete';

export default function FavoriteScreen() {
    const { data, loading, error, refetch } =
        useFetch<FavoriteItem[]>(`/favorite`);

    const [modoEliminar, setModoEliminar] = useState(false);
    const { apiBaseUrl } = useAppConfig();
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    if (loading) return <Loading size={64} color='blue' />;
    if (error) return <ErrorMessage error={error} reloadMethod={refetch} />;

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
                <RenderItemDelete
                    item={item}
                    handleDelete={handleDelete}
                    opacity={0.7}
                />
            );
        }

        return <RenderItem item={item} />;
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
});
