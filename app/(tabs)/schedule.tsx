import { useFetch } from '@/hooks/useFetch';
import { useTvRowFocus } from '@/hooks/useTvRowFocus';
import { FlashList } from '@shopify/flash-list';
import { Link } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    TVTextScrollView,
} from 'react-native';
const ITEM_WIDTH = 160;
const ITEM_HEIGHT = 200;

type ScheduleItem = {
    id: number;
    name: string;
    url: string;
    imgUrl: string;
    updateTimeAnime: string;
};

type ScheduleData = Record<
    | 'lunes'
    | 'martes'
    | 'miercoles'
    | 'jueves'
    | 'viernes'
    | 'sabado'
    | 'domingo',
    ScheduleItem[]
>;

export default function ScheduleScreen() {
    const { data, loading } = useFetch<ScheduleData>(
        'http://172.16.0.7:3000/anime/schedule'
    );

    const dayOrder: Array<keyof ScheduleData> = [
        'lunes',
        'martes',
        'miercoles',
        'jueves',
        'viernes',
        'sabado',
        'domingo',
    ];

    const rowRefs = React.useRef<Array<Array<React.RefObject<any>>>>([]);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size='large' color='#fff' />
            </View>
        );
    }

    const days = (data ? dayOrder.filter(d => (data as any)[d]) : []) as Array<
        keyof ScheduleData
    >;

    const DayItem = ({
        item,
        index,
        rowIndex,
        itemsLen,
        daysLen,
    }: {
        item: ScheduleItem;
        index: number;
        rowIndex: number;
        itemsLen: number;
        daysLen: number;
    }) => {
        const { ref, onFocus } = useTvRowFocus({
            rowRefs,
            rowIndex,
            index,
            itemsLen,
            rowsLen: daysLen,
        });

        return (
            <Link
                href={{
                    pathname: '/video/[slug]/details',
                    params: { slug: item.url },
                }}
                asChild>
                <TouchableOpacity
                    ref={ref}
                    focusable
                    onFocus={onFocus}
                    style={styles.itemContainer}>
                    <Image source={{ uri: item.imgUrl }} style={styles.image} />
                    <Text numberOfLines={1} style={styles.name}>
                        {item.name}
                    </Text>
                    <Text style={styles.time}>{item.updateTimeAnime}</Text>
                </TouchableOpacity>
            </Link>
        );
    };

    return (
        <TVTextScrollView
            showsVerticalScrollIndicator={false}
            style={{
                marginHorizontal: 20,
                paddingBottom: 40,
                paddingTop: 20,
            }}>
            {data &&
                days.map((dayKey, rowIndex) => {
                    const items = (data as any)[dayKey] as ScheduleItem[];
                    if (!rowRefs.current[rowIndex]) {
                        rowRefs.current[rowIndex] = [];
                    }
                    return (
                        <View key={dayKey} style={styles.dayBlock}>
                            <Text style={styles.dayTitle}>
                                {dayKey.charAt(0).toUpperCase() +
                                    dayKey.slice(1)}
                            </Text>

                            <FlashList
                                data={items}
                                keyExtractor={item => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item, index }) => (
                                    <DayItem
                                        item={item}
                                        index={index}
                                        rowIndex={rowIndex}
                                        itemsLen={items.length}
                                        daysLen={days.length}
                                    />
                                )}
                            />
                        </View>
                    );
                })}
        </TVTextScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayBlock: {
        marginHorizontal: 10,
        paddingHorizontal: 10,
        marginBottom: 30,
    },
    dayTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 14,
        color: 'white',
        marginBottom: 10,
        marginTop: 10,
    },
    itemContainer: {
        width: ITEM_WIDTH,
        height: 260,
        marginLeft: 14,
        alignItems: 'center',
    },
    image: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        borderRadius: 6,
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
    },
    time: {
        fontSize: 12,
        color: 'white',
        textAlign: 'center',
    },
});
