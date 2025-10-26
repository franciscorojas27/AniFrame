import { useState, useEffect } from 'react';

interface AnimeDetails {
    id: number;
    name: string;
    urlImg: string | null;
    favorited: boolean;
}

interface UseFavoriteProps {
    anime: AnimeDetails | null;
    slug: string | undefined;
}

export function useFavorite({ anime, slug }: UseFavoriteProps) {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [loadingFavorite, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (anime) {
            setIsFavorite(anime.favorited ?? false);
        }
    }, [anime, anime?.favorited]);

    const toggleFavorite = async () => {
        if (!anime || !slug) return;

        setLoading(true);
        try {
            if (!isFavorite) {
                await fetch('http://172.16.0.7:3000/favorite/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: anime.id,
                        name: anime.name,
                        slug,
                        urlImg: anime.urlImg,
                    }),
                });
                setIsFavorite(true);
            } else {
                await fetch(`http://172.16.0.7:3000/favorite/${anime.id}`, {
                    method: 'DELETE',
                });
                setIsFavorite(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return { isFavorite, loadingFavorite, toggleFavorite };
}
