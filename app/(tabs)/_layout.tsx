import React from 'react';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="login" options={{ title: 'Login' }} />
            <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
        </Tabs>
    );
}
