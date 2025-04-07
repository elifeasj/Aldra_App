import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qqmhshgabgopbnauuhhk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxbWhzaGdhYmdvcGJuYXV1aGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcwNzA5NjAsImV4cCI6MjAyMjY0Njk2MH0.QALnKHlJQ-0xvXn7YGoxYqON1SQz_AZDtIxNJI4aBGY';

export const supabase = createClient(supabaseUrl, supabaseKey);
