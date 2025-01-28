import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#42865F',
            tabBarInactiveTintColor: '#666',
            tabBarLabelStyle: {
                fontFamily: 'RedHatDisplay_400Regular',
                fontSize: 12,
            },
            headerShown: false,
        }}>
            <Tabs.Screen 
                name="vejledning" 
                options={{
                    title: 'Vejledning',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="minder" 
                options={{
                    title: 'Minder',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="oversigt" 
                options={{
                    title: 'Oversigt',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="kalender" 
                options={{
                    title: 'Kalender',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="profil" 
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
