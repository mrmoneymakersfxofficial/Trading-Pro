// Database helper using Supabase PostgreSQL via pg driver
// Used for server-side operations that need direct SQL access

import { Client } from "pg";

const CONNECTION_STRING = process.env.DATABASE_URL!;

let _client: Client | null = null;

export async function getDb(): Promise<Client> {
  if (!_client) {
    _client = new Client({
      connectionString: CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
    });
    await _client.connect();
  }
  return _client;
}

// For serverless/edge: create a new client per request
export function createDbClient(): Client {
  return new Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });
}

// Helper: query with auto-connect/disconnect per request
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = new Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    await client.end();
  }
}

// Helper: single row
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
