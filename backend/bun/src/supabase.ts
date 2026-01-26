import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Pool } from 'pg';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // use service role for server

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get Postgres connection from Supabase
const pool = new Pool({
  connectionString: `${SUPABASE_URL.replace('https://', 'postgres://')}?sslmode=require`,
  // OR you can use supabase credentials directly:
  user: 'postgres', // from Supabase project settings
  password: process.env.SUPABASE_DB_PASSWORD,
  host: process.env.SUPABASE_DB_HOST,
  database: process.env.SUPABASE_DB_NAME,
  port: Number(process.env.SUPABASE_DB_PORT) || 5432,
});

export const db = drizzle(pool);
