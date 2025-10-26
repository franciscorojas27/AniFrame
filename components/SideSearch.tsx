import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const THEME = {
    colors: {
        background: '#0B0B0F',
        text: '#EAEAEA',
        muted: '#9AA0A6',
        primary: '#00A3FF',
        border: '#2A2A2A',
        card: '#191919',
    },
    spacing: 12,
    radius: 10,
};

type SearchBarProps = {
    querySearch: string;
    setQuerySearch: (text: string) => void;
    onSearch: () => void;
};
export default function SearchBar({
    querySearch,
    setQuerySearch,
    onSearch,
}: SearchBarProps) {
    return (
        <View
            style={[
                styles.sideSearch,
                {
                    paddingHorizontal: THEME.spacing,
                    paddingTop: THEME.spacing,
                },
            ]}>
            <View
                style={[
                    styles.searchContainer,
                    {
                        borderColor: THEME.colors.border,
                        backgroundColor: '#121214',
                        borderRadius: THEME.radius,
                    },
                ]}>
                <Text style={{ color: THEME.colors.muted, marginRight: 8 }}>
                    🔍
                </Text>
                <TextInput
                    placeholder='Search anime...'
                    placeholderTextColor={THEME.colors.muted}
                    value={querySearch}
                    onChangeText={setQuerySearch}
                    onSubmitEditing={onSearch}
                    style={[styles.searchInput, { color: THEME.colors.text }]}
                    returnKeyType='search'
                />
                <TouchableOpacity
                    onPress={onSearch}
                    style={[
                        styles.searchButton,
                        {
                            backgroundColor: THEME.colors.primary,
                            borderRadius: THEME.radius - 2,
                        },
                    ]}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
    },
    sideSearch: {
        width: 300,
        backgroundColor: 'white',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        height: 42,
    },
    searchButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginLeft: 8,
    },
    searchButtonText: {
        color: '#0B0B0B',
        fontWeight: '600',
    },
    gridContent: {
        paddingTop: 8,
    },
    card: {
        margin: 5,
        backgroundColor: '#191919',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    posterImage: {
        width: '100%',
        aspectRatio: 2 / 3,
        resizeMode: 'cover',
        backgroundColor: '#ccc',
    },
    titleContainer: {
        paddingHorizontal: 8,
        justifyContent: 'center',
    },
    itemText: {
        color: '#EAEAEA',
        textAlign: 'center',
    },
    footerLoading: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
});
