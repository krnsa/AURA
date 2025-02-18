// Suppress deprecation warnings (Temporary solution)
process.noDeprecation = true;

import express from 'express';
//import userRoutes from './routes/userRoutes.js';
//import postRoutes from './routes/postRoutes.js';
import cors from 'cors';
import supabase from './models/supabaseClient.js';

const app = express();

app.use(cors());
app.use(express.json());

//app.use('/api/users', userRoutes);
//app.use('/api/posts', postRoutes);

async function testDatabase() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select()
            .limit(2);

        if (error) {
            throw error;
        } else if (data.length === 0) {
            console.log('⚠️ Supabase query succeeded but no data found.');
        } else {
            console.log(data,'✅ Supabase query succeeded:');
        }
    } catch (err) {
        console.error('❌ Supabase query failed:', err.message);
    }
}

testDatabase();

export default app;