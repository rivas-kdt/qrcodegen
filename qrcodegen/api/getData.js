import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Fetch data from PostgreSQL
    const { rows } = await sql`SELECT * FROM qrdata WHERE id = 23`;

    // Return the data as a JSON response
    res.status(200).json({ data: rows });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data from database' });
  }
}