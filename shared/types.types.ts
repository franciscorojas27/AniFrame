export type Anime = {
    id: number;
    cap: number;
    name: string;
    slug: string;
    imgUrl: string;
};

export type ScheduleItem = Omit<Anime, 'cap'> & {
    url: string;
    updateTimeAnime: string;
};

export type ScheduleData = Record<
    | 'lunes'
    | 'martes'
    | 'miercoles'
    | 'jueves'
    | 'viernes'
    | 'sabado'
    | 'domingo',
    ScheduleItem[]
>;

export type FavoriteItem = Omit<Anime, 'cap'>;

export type AnimeDetails = Omit<Anime, 'cap'> & {
    description: string | null;
    status: string;
    date: string;
    genres: string[];
    caps: number;
    favorited: boolean;
    lastEpisode: number;
};
