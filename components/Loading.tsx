import { View, ActivityIndicator } from 'react-native';
export default function Loading({
    color = '#0000ff',
    size = 36,
}: {
    color: string;
    size: number;
}) {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
}
