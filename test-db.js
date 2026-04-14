import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkDB() {
  const { data, error } = await supabase.from('emission_factor_headers').select('*').limit(1);
  if (error) {
    console.error("Error connecting or table doesn't exist:", error.message);
  } else {
    console.log("Connection successful. Table exists. Rows found:", data.length);
  }
}

checkDB();
