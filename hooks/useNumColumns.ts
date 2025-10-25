import { Dimensions, Platform } from 'react-native';

export const useNumColumns = () => {
    const SCREEN_WIDTH = Dimensions.get('window').width;
    return Platform.isTV
        ? 4
        : SCREEN_WIDTH >= 900
          ? 2
          : SCREEN_WIDTH >= 768
            ? 4
            : SCREEN_WIDTH >= 600
              ? 3
              : 2;
};
