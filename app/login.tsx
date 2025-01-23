import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

export default function LoginScreen() {
  return (
    <ImageBackground
      source={require('../assets/images/baggrund-1.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.logo}>Aldra</Text>
        <Text style={styles.subtitle}>Minder, omsorg og nærvær – samlet ét sted</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Opret ny bruger</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.loginLink}>Har du allerede en konto? Log ind</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
