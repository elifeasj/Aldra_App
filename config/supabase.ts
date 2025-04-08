import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Indlæs miljøvariabler fra .env filen
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
