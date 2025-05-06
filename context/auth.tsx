import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  relationToDementiaPerson: string;
  profile_image?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const parsed = JSON.parse(userDataString);
  
        if (!parsed || !parsed.id || !parsed.name || !parsed.email) {
          console.warn("❌ Ugyldig eller manglende brugerdata:", parsed);
          setUser(null);
        } else {
          setUser(parsed);
        }
      } else {
        console.warn("⚠️ Ingen brugerdata fundet i AsyncStorage.");
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Fejl ved indlæsning/parsing af brugerdata:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
