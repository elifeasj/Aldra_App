import { useRouter } from 'expo-router';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';

export default function Onboarding1() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1); // Start på første trin

    const handleNext = () => {
        if (currentStep < 5) { // Antal onboarding-sider
            setCurrentStep(currentStep + 1);
        } else {
            router.push('/onboarding/onboarding_2'); // Gå videre til næste onboarding
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.push('/'); // Gå tilbage til index.js
        }
    };

    return (
        <View style={styles.container}>
            {/* Billede */}
            <Image
                source={require('../../assets/images/intro_1.png')} // Skift til dit billede
                style={styles.image}
            />

            <View style={styles.topContainer}>
                <Text style={styles.title}>Få struktur i din hverdag</Text>
                <Text style={styles.subtitle}>Planlæg dine besøg i kalenderen</Text>
                <Text style={styles.description}>
                    Skriv noter om dine oplevelser, og få påmindelser om dine kommende aftaler.
                </Text>
            </View>

            {/* Punkttegn */}
            <View style={styles.dotsContainer}>
                {[1, 2, 3, 4, 5].map((step) => (
                    <Text
                        key={step}
                        style={[
                            styles.dot,
                            currentStep >= step && styles.activeDot, // Aktivt punktændring
                        ]}
                    >
                        •
                    </Text>
                ))}
            </View>

            <View style={styles.buttonContainer}>
                    {/* Forrige knap */}
                    <TouchableOpacity
                        style={[styles.button, styles.prevButton]} // Forrige knap specifik stil
                        onPress={handlePrev} // Naviger tilbage til forrige trin
                    >
                        <View style={styles.buttonContent}>
                            <Icon name="chevron-back-outline" size={25} color="#42865F" />
                            <Text style={styles.prevButtonText}>Forrige</Text>
                        </View>
                    </TouchableOpacity>

                {/* Næste knap */}
                <TouchableOpacity
                    style={[styles.button, styles.nextButton]} // Næste knap specifik stil
                    onPress={handleNext} // Naviger til næste onboarding_2
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.nextButtonText}>Næste</Text>
                        <Icon name="chevron-forward-outline" size={25} color="#FFF" />
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
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    image: {
        width: '100%',  // Billedets bredde fylder hele skærmen
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
        fontSize: 36,
        fontWeight: 'bold',
        color: '#42865F',
        marginBottom: 8,
        textAlign: 'left',  // Venstrejuster tekst
        
    },
    subtitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#42865F',
        marginBottom: 20,
        textAlign: 'left',  // Venstrejuster tekst
        lineHeight: 27,
        
    },
    description: {
        fontSize: 20,
        color: '#42865F',
        textAlign: 'left',  // Venstrejuster tekst
        lineHeight: 27,
        marginBottom: 20,
        paddingRight: 39,
    },
    button: {
        paddingVertical: 13,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '40%', // Juster knapperne så de ikke fylder hele bredden
        marginBottom: 20,
    },
    prevButton: {
        backgroundColor: '#FFFFFF',
        borderColor: '#42865F',
        borderWidth: 1,
    },
    nextButton: {
        backgroundColor: '#42865F',
        borderColor: '#3E8E7E',
        borderWidth: 1,
    },
    buttonContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    prevButtonText: {
        color: '#42865F',  // Forrige knap tekstfarve
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '60',
        marginLeft: 20, // Afstand mellem tekst og ikon
    },
    nextButtonText: {
        color: '#FFFFFF',  // Næste knap tekstfarve
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '60',
        marginRight: 20, // Afstand mellem tekst og ikon
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
