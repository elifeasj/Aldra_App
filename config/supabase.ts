import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

// Sikrer at appen ikke crasher udenfor Expo Go eller hvis env mangler
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase credentials mangler! Tjek app.config.js og env setup.");
  throw new Error('Supabase URL og Anon Key mangler!');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_ANON_KEY:", supabaseAnonKey);

export default supabase;
