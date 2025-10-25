# Guía para evitar saltos de foco en Android TV (React Native / Expo Router)

Esta guía documenta cómo prevenir y arreglar los problemas típicos de navegación con DPAD (foco) en Android TV cuando tienes listas horizontales apiladas verticalmente (por ejemplo, un horario por días), o pantallas con varias tabs.

## Problema típico

- Al llegar al final de una fila horizontal, al pulsar DPAD Derecha, el foco “salta” a la fila siguiente (u otra vista) en lugar de quedarse.
- Al moverte entre filas con DPAD Arriba/Abajo, el foco no mantiene la misma columna y cae en elementos inesperados (por ejemplo, al subir desde domingo a lunes, cae en el último de domingo o en un extremo).
- Al volver desde la barra de tabs con DPAD Abajo, el foco no entra en la lista de la pantalla activa.

## Causas comunes

- React Native no resuelve automáticamente la navegación espacial para TV; si no fijas los objetivos `nextFocus*`, usa proximidad y puede elegir destinos inesperados.
- Listas virtualizadas (FlashList/FlatList) reciclan vistas; si asignas rutas de foco una sola vez, pueden perderse.
- Contenedores con alturas pequeñas o centrados que reducen la zona “focuseable” (por ejemplo, una lista con `height: 50`).

## Patrón recomendado (Android TV)

1. Establece un orden fijo para las filas

- Mantén un array de filas (por ejemplo, días) con orden conocido. Ejemplo:
    ```ts
    const dayOrder = [
        'lunes',
        'martes',
        'miercoles',
        'jueves',
        'viernes',
        'sabado',
        'domingo',
    ];
    const days = dayOrder.filter(d => data[d]);
    ```

2. Guarda refs por celda

- Para cada fila (rowIndex) y columna (index), guarda un `ref` del `TouchableOpacity`:
    ```ts
    const rowRefs = useRef<Array<Array<RefObject<any>>>>([]);
    ```

3. Trampas en bordes izquierdo/derecho

- En el primer y el último elemento de cada fila, usa `setNativeProps` para apuntar los bordes a sí mismos:
    ```ts
    if (isFirst) node.setNativeProps({ nextFocusLeft: handle });
    if (isLast) node.setNativeProps({ nextFocusRight: handle });
    ```
- Esto evita que DPAD Izquierda/Derecha “cruce” accidentalmente a otras filas o vistas.

4. Mapeo vertical por columna en `onFocus`

- Cuando un ítem recibe foco, configura `nextFocusUp` y `nextFocusDown` para apuntar a la misma columna de la fila superior/inferior (o al último si la fila es más corta):
    ```ts
    const setDir = (dir: 'up' | 'down', targetRow: number) => {
        const row = rowRefs.current[targetRow];
        const targetRef = row[Math.min(index, row.length - 1)];
        const handle = findNodeHandle(targetRef?.current);
        if (handle) {
            currentNode.setNativeProps(
                dir === 'up'
                    ? { nextFocusUp: handle }
                    : { nextFocusDown: handle }
            );
        }
    };
    ```

5. Para tabs: focus-catcher y gating

- Cuando bajes desde la barra de tabs, añade un header invisible en la lista que reciba foco y redirija al primer ítem:
    ```tsx
    <FlashList
        ListHeaderComponent={
            <TouchableOpacity
                focusable
                onFocus={() => {
                    firstItemRef.current?.setNativeProps({
                        hasTVPreferredFocus: true,
                    });
                }}
                style={{ height: 1, opacity: 0 }}
            />
        }
    />
    ```
- En cada pantalla bajo tabs, desactiva foco cuando no esté activa:
    ```tsx
    importantForAccessibility={isFocused ? 'auto' : 'no-hide-descendants'}
    focusable={isFocused}
    ```

6. Evita hooks en funciones inline de render

- Si necesitas `useEffect` por celda, crea un componente hijo (por ejemplo `DayItem`) y pon ahí los hooks. No uses hooks dentro de `renderItem` inline.

## “Opción fácil”: mínima fricción

Si no quieres manejar refs por celda aún, puedes aplicar estas dos medidas rápidas:

- Trampa en extremos por fila (reduce el 80% de los saltos laterales):
    - En cada elemento extremo (index 0 y último), asigna `nextFocusLeft/Right` a sí mismo en un `useEffect` dentro de un componente hijo por ítem.

- Focus-catcher al entrar desde tabs:
    - Añade un `ListHeaderComponent` invisible que, al enfocarse, empuje el foco al primer elemento de la lista.

Esto ya evita la mayoría de los saltos molestos sin implementar el mapeo por columna. Cuando puedas, añade el paso 4 para tener navegación vertical perfecta.

## Cómo arreglarlo si vuelve a aparecer

1. Verifica que la lista ocupa el espacio (flex: 1) y no está centrada con altura pequeña.
2. Comprueba que `focusable` y `importantForAccessibility` solo son “activos” en la pantalla visible (tabs).
3. Revisa que los extremos de cada fila tienen self-trap.
4. Agrega los `nextFocusUp/Down` en `onFocus` usando los `rowRefs`.
5. Si hay celdas virtualizadas que se reciclan, recalcula las rutas en cada `onFocus` (no sólo al montar).

## Plataforma y compatibilidad

- Esta técnica usa `setNativeProps({ nextFocusLeft/Right/Up/Down })` que está soportado en Android TV. En iOS/tvOS el foco funciona distinto (TVFocusGuide), por eso se limita a `Platform.OS === 'android' && Platform.isTV`.

## Checklist rápido

- [ ] `dayOrder` y `days` con orden fijo
- [ ] `rowRefs[rowIndex][index]` asignado
- [ ] `nextFocusLeft` en el primer ítem y `nextFocusRight` en el último
- [ ] `nextFocusUp/Down` en `onFocus` hacia misma columna
- [ ] Focus-catcher para tabs y gating por pantalla activa
- [ ] Hooks sólo en componentes hijo, no inline en `renderItem`

## Ejemplo de patrón por ítem (Android TV)

```tsx
function DayItem({ item, index, rowIndex, itemsLen, daysLen, itemRef }) {
    const isTVAndroid = Platform.OS === 'android' && Platform.isTV;
    const isFirst = index === 0;
    const isLast = index === itemsLen - 1;

    React.useEffect(() => {
        if (!isTVAndroid) return;
        const node = itemRef.current;
        const handle = node ? findNodeHandle(node) : null;
        if (!handle || !(node as any)?.setNativeProps) return;
        const props = {} as any;
        if (isFirst) props.nextFocusLeft = handle;
        if (isLast) props.nextFocusRight = handle;
        if (Object.keys(props).length) (node as any).setNativeProps(props);
    }, [isTVAndroid, isFirst, isLast, itemRef]);

    const onFocus = () => {
        if (!isTVAndroid) return;
        const currentNode = itemRef.current as any;
        if (!currentNode?.setNativeProps) return;
        const setDir = (dir: 'up' | 'down', targetRow: number) => {
            const row = rowRefs.current[targetRow];
            if (!row) return;
            const targetRef = row[Math.min(index, row.length - 1)];
            const handle = findNodeHandle(targetRef?.current);
            if (handle)
                currentNode.setNativeProps(
                    dir === 'up'
                        ? { nextFocusUp: handle }
                        : { nextFocusDown: handle }
                );
        };
        if (rowIndex > 0) setDir('up', rowIndex - 1);
        if (rowIndex < daysLen - 1) setDir('down', rowIndex + 1);
    };

    return (
        <TouchableOpacity ref={itemRef} focusable onFocus={onFocus}>
            {/* contenido */}
        </TouchableOpacity>
    );
}
```

---

¿Quieres que convierta este patrón en un pequeño hook/util para reutilizar en otras pantallas (por ejemplo, `useTvRowFocus`)? Puedo prepararlo y dejarlo en `hooks/` con un ejemplo de uso.

```tsx
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

    // Orden fijo de días para navegación vertical consistente
    const dayOrder: Array<keyof ScheduleData> = [
        'lunes',
        'martes',
        'miercoles',
        'jueves',
        'viernes',
        'sabado',
        'domingo',
    ];

    // Refs por fila y columna: rowRefs[rowIndex][colIndex] -> ref del item
    const rowRefs = React.useRef<Array<Array<React.RefObject<any>>>>([]);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size='large' color='#fff' />
            </View>
        );
    }

    // Dias disponibles en el payload respetando orden definido
    const days = (data ? dayOrder.filter(d => (data as any)[d]) : []) as Array<
        keyof ScheduleData
    >;

    // Componente hijo para manejar efectos y foco por item
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
                    // Asegurar array de refs para esta fila
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
```
