import React from 'react';
import { StyleSheet, Text, View, ImageBackground } from 'react-native';

export default function LoginScreen() {
  /* return (
    <ImageBackground
      source={require('/images/baggrund-1.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.text}>Velkommen til AldraApp!</Text>
      </View>
    </ImageBackground>
  ); */
}

<Text>Velkommen til AldraApp!</Text>

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
    paddingHorizontal: 16,
    backgroundColor: '#fffff',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0000', // 
    textAlign: 'center',
  },
});
