// api/getData.ts
import { createClient } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = createClient();
  
  try {
    await client.connect();
    console.log('Connected to database'); // Log successful connection
    
    // Perform query
    const { rows } = await client.sql`
      SELECT * FROM qrdata;
    `;
    
    console.log('Query successful, data:', rows); // Log successful query result
    res.status(200).json({ posts: rows });
    
  } catch (error) {
    console.error('Error querying the database:', error); // Log errors
    res.status(500).json({ error: 'Failed to query database' });
  } finally {
    await client.end();
    console.log('Disconnected from database'); // Log successful disconnection
  }
}
