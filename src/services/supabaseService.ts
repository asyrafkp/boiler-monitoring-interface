import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase is optional - only needed for admin uploads
// GitHub-hosted JSON is used for viewing data
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase connected (optional - for admin uploads)');
} else {
  console.log('ℹ️ Supabase not configured - admin uploads disabled');
}

export { supabase };

// Store boiler data readings
export async function storeBoilerReading(data: {
  b1_steam: number;
  b2_steam: number;
  b3_steam: number;
  b1_water: number;
  b2_water: number;
  b3_water: number;
  ng_ratio: number;
  timestamp: string;
}) {
  const { error } = await supabase
    .from('boiler_readings')
    .insert([
      {
        b1_steam: data.b1_steam,
        b2_steam: data.b2_steam,
        b3_steam: data.b3_steam,
        b1_water: data.b1_water,
        b2_water: data.b2_water,
        b3_water: data.b3_water,
        ng_ratio: data.ng_ratio,
        created_at: data.timestamp,
      },
    ]);

  if (error) {
    console.error('Error storing boiler reading:', error);
    throw error;
  }
}

// Get latest boiler readings
export async function getLatestBoilerReadings() {
  const { data, error } = await supabase
    .from('boiler_readings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching boiler readings:', error);
    throw error;
  }

  return data?.[0] || null;
}

// Get historical data
export async function getBoilerHistory(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('boiler_readings')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching boiler history:', error);
    throw error;
  }

  return data || [];
}
