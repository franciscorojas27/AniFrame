import { Link } from 'expo-router';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

export default function RenderItem({
    item,
}: {
    item: {
        slug: string;
        imgUrl: string;
        name: string;
    };
}) {
    return (
        <Link
            href={{
                pathname: '/video/[slug]/details',
                params: { slug: item.slug },
            }}
            asChild>
            <TouchableOpacity activeOpacity={0.6} style={styles.element}>
                <Image style={styles.itemImg} source={{ uri: item.imgUrl }} />
                <Text numberOfLines={1} style={styles.text}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        </Link>
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
});
