import { NativeTabs, Label, Icon } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

import WebTabLayout from './TabLayout.web';

export default function TabLayout() {
    if (Platform.OS === 'android' && Platform.isTV) {
        return <WebTabLayout />;
    }
    return (
        <NativeTabs
        // Prevent accidental swipe or DPAD right from switching tabs on TV
        // Note: NativeTabs doesn't expose swipeEnabled prop; rely on focus trapping per screen
        >
            <NativeTabs.Trigger name='index'>
                <Label>Home</Label>
                <Icon sf='house' />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name='explore'>
                <Label>Explore</Label>
                <Icon sf='atom' />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name='activity_history'>
                <Label>Activity</Label>
                <Icon sf='tv.fill' />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name='schedule'>
                <Label>Schedule</Label>
                <Icon sf='calendar.day.timeline.leading' />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
