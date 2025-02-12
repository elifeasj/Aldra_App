import React, { useEffect, useState } from 'react';
import { StatusBar, View, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Funktion til at bestemme, om en farve er lys eller mørk
const isLightColor = (hexColor: string = '#FFFFFF'): boolean => {
    try {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
    } catch {
        return true;
    }
};

export const DynamicStatusBar: React.FC<{ backgroundColor: string }> = ({ backgroundColor }) => {
    const [barStyle, setBarStyle] = useState<'light-content' | 'dark-content'>(isLightColor(backgroundColor) ? 'dark-content' : 'light-content');

    useFocusEffect(
        React.useCallback(() => {
            setBarStyle(isLightColor(backgroundColor) ? 'dark-content' : 'light-content');
        }, [backgroundColor])
    );

    return (
        <View style={{ 
            backgroundColor, 
            height: Platform.OS === 'ios' ? 44 : 50,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 999 
        }}>
            <StatusBar 
                backgroundColor={backgroundColor} 
                barStyle={barStyle} 
                translucent={false} 
            />
        </View>
    );
};
