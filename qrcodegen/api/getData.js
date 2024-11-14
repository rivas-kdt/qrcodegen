import { createClient } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = createClient();
  await client.connect();

  try {
    const { rows } = await client.sql`
      SELECT * FROM qrdata;
    `;
    
    res.status(200).json({ posts: rows });
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({ error: "Failed to query database" });
  } finally {
    await client.end();
  }
}