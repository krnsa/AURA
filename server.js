// Import required modules
import 'dotenv/config'; // Load environment variables from .env file
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL; // Supabase project URL
const supabaseKey = process.env.SUPABASE_KEY; // Supabase API key

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);


// Optional: Test the connection by fetching data from a table
async function testConnection() {
  const { data, error } = await supabase
    .from('your_table_name') // Replace with your table name
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error connecting to Supabase:', error);
  } else {
    console.log('Connection successful! Data:', data);
  }
}

// Call the test function
testConnection();