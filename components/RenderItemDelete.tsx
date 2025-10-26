import { FavoriteItem } from '@/shared/types.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';

export default function RenderItemDelete({
    item,
    handleDelete,
    opacity,
}: {
    item: FavoriteItem;
    handleDelete: (id: number) => void;
    opacity: number;
}) {
    return (
        <TouchableOpacity
            activeOpacity={opacity}
            style={styles.element}
            onPress={() => handleDelete(item.id)}>
            <Image style={styles.itemImg} source={{ uri: item.imgUrl }} />
            <View style={styles.deleteOverlay}>
                <MaterialIcons name='delete-forever' size={24} color='white' />
            </View>
            <Text numberOfLines={1} style={styles.text}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
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
        aspectRatio: 2 / 3,
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
