import { createClient } from '@supabase/supabase-js';

// Type assertion, da vi ved at disse variabler er defineret i .env
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
