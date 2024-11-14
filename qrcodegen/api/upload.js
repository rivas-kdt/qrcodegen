import { IncomingForm } from 'formidable';
import fs from 'fs';
import { put } from '@vercel/blob'; // Vercel Blob SDK
import { Client } from 'pg'; // PostgreSQL client

// Disable default body parser to use 'formidable'
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadHandler = async (req, res) => {
  const form = new IncomingForm();
  form.uploadDir = '/tmp'; // Temp storage in Vercel's serverless environment
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Failed to parse form data', details: err.message });
    }

    const file = files.image[0];  // Access the uploaded file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uuid = fields.uuid[0];  // Get UUID from form data (sent from frontend)
    const latitude = fields.latitude[0];  // Get latitude
    const longitude = fields.longitude[0]; // Get longitude

    try {
      // Upload the file to Vercel Blob
      const blob = await put(file.originalFilename, fs.readFileSync(file.filepath), {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN, // Token for authorization
      });

      // Database connection using the pg package
      const client = new Client({
        connectionString: process.env.DATABASE_URL, // Your database connection URL (from Vercel environment variable)
      });

      await client.connect();

      // Insert image metadata into the 'images' table
      const result = await client.query(
        'INSERT INTO images (uuid, url, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *',
        [uuid, blob.url, latitude, longitude]
      );

      // Respond with the file metadata including uuid, location, and URL
      const insertedData = result.rows[0]; // Get the inserted row data
      return res.status(200).json({
        uuid: insertedData.uuid,
        location: insertedData.url,  // Blob URL
        latitude: insertedData.latitude,
        longitude: insertedData.longitude,
        created_at: insertedData.created_at,
      });
    } catch (error) {
      console.error('Error uploading to Vercel Blob or saving to Postgres:', error);
      return res.status(500).json({ error: 'Failed to upload file or save metadata', details: error.message });
    } finally {
      await client.end();
    }
  });
};

export default uploadHandler;
