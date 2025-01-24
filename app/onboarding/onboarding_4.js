import { useRouter } from 'expo-router';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function Onboarding2() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Få struktur i din hverdag</Text>
            <TouchableOpacity 
                style={styles.button} 
                onPress={() => router.push('/onboarding/onboarding_2')}
            >
                <Text style={styles.buttonText}>Næste</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
