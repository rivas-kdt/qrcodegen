import { IncomingForm } from 'formidable';  // For handling file uploads
import fs from 'fs';
import { put } from '@vercel/blob'; // Vercel Blob SDK

// Disable default body parser to use 'formidable' for file uploads
export const config = {
  api: {
    bodyParser: false,  // Disable the default body parser to handle file uploads manually
  },
};

export default async function handler(req, res) {
  const form = new IncomingForm();
  form.uploadDir = '/tmp';  // Temp storage in Vercel's serverless environment
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
    const latitude = parseFloat(fields.latitude[0]);  // Get latitude (from frontend)
    const longitude = parseFloat(fields.longitude[0]); // Get longitude (from frontend)

    try {
      // Upload the file to Vercel Blob storage
      const blob = await put(file.originalFilename, fs.readFileSync(file.filepath), {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN, // Token for authorization
      });

      console.log("Blob upload successful:", blob); // Log the blob response

      if (!blob || !blob.url) {
        throw new Error("Failed to upload to Vercel Blob or missing URL in response");
      }

    } catch (error) {
      console.error('Error uploading to Vercel Blob or saving to Postgres:', error);
      return res.status(500).json({ error: 'Failed to upload file or save metadata', details: error.message });
    }
  });
}
