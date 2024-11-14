import { createClient } from '@vercel/postgres';

export default async function handler(req, res) {
  // Create a new database client
  const client = createClient();

  // Connect to the database
  await client.connect();

  try {
    // Example of using a parameterized query to prevent SQL injection
    const likes = 100; // You could use a dynamic value from the query params or request body
    const { rows, fields } = await client.sql`
      SELECT * FROM qrdata;
    `;
    
    // Return the rows from the query as a JSON response
    res.status(200).json({ posts: rows });
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({ error: "Failed to query database" });
  } finally {
    // Always ensure you close the client connection after the query
    await client.end();
  }
}