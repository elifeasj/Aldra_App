import { Stack } from 'expo-router';

export default function ModalLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                presentation: 'modal',
                animation: 'slide_from_bottom',
            }}
        />
    );
}
