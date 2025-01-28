import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            headerLeft: () => null,
            tabBarActiveTintColor: '#42865F',
            tabBarInactiveTintColor: '#666666',
            tabBarStyle: {
                borderTopColor: '#EAEAEA',
                height: 84,
                paddingTop: 8,
                paddingBottom: 32,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontFamily: 'RedHatDisplay_400Regular',
            }
        }}>
            <Tabs.Screen
                name="vejledning"
                options={{
                    title: 'Vejledning',
                    tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={24} color={color} />,
                }} 
            />
            <Tabs.Screen
                name="minder"
                options={{
                    title: 'Minder',
                    tabBarIcon: ({ color }) => <Ionicons name="images-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="oversigt"
                options={{
                    title: 'Oversigt',
                    tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="kalender"
                options={{
                    title: 'Kalender',
                    tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profil"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
