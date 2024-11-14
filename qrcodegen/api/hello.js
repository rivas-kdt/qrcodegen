import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // Send a response with status 200 and a JSON object
    const pets = await sql`SELECT * FROM Pets;`;
    res.status(200).json({ pets });
  }
  