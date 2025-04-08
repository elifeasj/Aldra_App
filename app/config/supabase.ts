import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase config mangler");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
