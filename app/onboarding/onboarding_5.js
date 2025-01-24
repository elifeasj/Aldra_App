import { useRouter } from 'expo-router';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';

export default function Onboarding5() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(5); // Start på første trin

    const handleNext = () => {
        if (currentStep < 5) { // Antal onboarding-sider
            setCurrentStep(currentStep + 1);
        } else {
            router.push('/onboarding/register'); // Gå videre til næste onboarding
        }
    };

    const handlePrev = () => {
        if (currentStep > 5) {
            setCurrentStep(currentStep - 5);
        } else {
            router.push('/onboarding/onboarding_4'); // Gå tilbage
        }
    };

    return (
        <View style={styles.container}>
            {/* Billede */}
            <Image
                source={require('../../assets/images/intro_5.png')} // Skift til dit billede
                style={styles.image}
            />

            <View style={styles.topContainer}>
                <Text style={styles.title}>Nu er du klar til at bruge Aldra!</Text>
                <Text style={styles.description}>
                    Opret en profil, og lad os hjælpe dig med at skabe struktur og tryghed.</Text>
            </View>

            <View style={styles.buttonContainer}>
                {/* Næste knap */}
                <TouchableOpacity
                    style={[styles.button, styles.nextButton]} // Næste knap specifik stil
                    onPress={handleNext} // Naviger til næste onboarding_2
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.nextButtonText}>Opret bruger</Text>
                        <Icon name="chevron-forward-outline" size={25} color="#42865F" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#42865F',
        paddingHorizontal: 20,
    },
    image: {
        width: '90%',  // Billedets bredde fylder hele skærmen
        height: '50%',  // Juster højde
        resizeMode: 'contain',  // Sørger for at billedet ikke bliver strakt
        marginBottom: 0,
        marginTop: 60,
    },
    topContainer: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'flex-start', // Justeret til venstrejustering
        marginBottom: 100,
        width: '100%',

    },
    contentContainer: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'flex-start',  // Sørger for at teksten er til venstre
    },
    buttonContainer: {
        flexDirection: 'row',  // Vigtigt for at placere knapperne på hver sin side
        justifyContent: 'space-between',  // Sørger for at knapperne er på hver sin side
        alignItems: 'center',
        width: '100%',
        marginBottom: 50,
        paddingHorizontal: 0,
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'left',  // Venstrejuster tekst
        paddingRight: 30,
        
    },

    description: {
        fontSize: 24,
        fontWeight: 'regular',
        color: '#ffff',
        textAlign: 'left',  // Venstrejuster tekst
        lineHeight: 35,
        marginBottom: 70,
        paddingRight: 50,
    },
    button: {
        paddingVertical: 13,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '100%', // Juster knapperne så de ikke fylder hele bredden
        marginBottom: 20,
    },
    nextButton: {
        backgroundColor: '#ffff',
        borderColor: '#fff',
        borderWidth: 1,
    },
    buttonContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    nextButtonText: {
        color: '#42865F',  // Næste knap tekstfarve
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '60',
        flex: 1,
        marginRight: 0, // Afstand mellem tekst og ikon
    },
    buttonIcon: {
        marginLeft: 10,
    }, 

    dotsContainer: {
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30, // Afstand til knapperne
    },
    dot: {
        fontSize: 45,
        color: 'rgba(132, 132, 132, 0.4)',
        marginHorizontal: 1,
    },
    activeDot: {
        color: '#42865F', // Farve for aktive punkter
    },
});
