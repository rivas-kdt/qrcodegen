import { db } from "@vercel/postgres";

export default async function handler(request, response) {
  const client = await db.connect();
  try {
    await client.sql`INSERT INTO qrdata (id, url, latitude, longitude) VALUES (1,'2',3,4);`;
  } catch (error) {
    return response.status(500).json({ error });
  }

  const qrdata = await sql`SELECT * FROM qrdata`;
  return response.status(200).json({ qrdata });
}
