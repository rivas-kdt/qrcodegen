import { IncomingForm } from "formidable";
import fs from "fs";
import { put } from "@vercel/blob";  // Vercel Blob SDK
import { db } from '@vercel/postgres';

// Disable default body parser to use 'formidable'
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadHandler = async (req, res) => {
  const form = new IncomingForm();
  form.uploadDir = "/tmp"; // Temp storage in Vercel's serverless environment
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Failed to parse form data", details: err.message });
    }

    const file = files.image[0];  // Access the uploaded file
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uuid = fields.uuid[0];  // Get UUID from form data (sent from frontend)

    try {
      // Upload the file to Vercel Blob
      const blob = await put(file.originalFilename, fs.readFileSync(file.filepath), {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN, // Token for authorization
      });
      const client = await db.connect();
      await client.sql`INSERT INTO qrdata (id, url, latitude, longitude) VALUES (${uuid}, ${blob.url}, 145.5955, 12.9808)`;

      // Respond with the file metadata including uuid, location, and URL
      return res.status(200).json({
        uuid: uuid,
        location: file.filepath,  // Temporary storage location in Vercel
        url: blob.url,            // URL of the uploaded blob
      });
    } catch (error) {
      console.error("Error uploading to Vercel Blob:", error);
      return res.status(500).json({ error: "Failed to upload file", details: error.message });
    }
  });
};

export default uploadHandler;
