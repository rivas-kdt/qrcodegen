import { IncomingForm } from 'formidable';
import fs from 'fs';
import { put } from '@vercel/blob';  // Vercel Blob SDK

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

    try {
      // Upload the file to Vercel Blob
      const blob = await put(file.originalFilename, fs.readFileSync(file.filepath), {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN, // Token for authorization
      });

      // Respond with the URL of the uploaded file
      return res.status(200).json({ url: blob.url });
    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error);
      return res.status(500).json({ error: 'Failed to upload file', details: error.message });
    }
  });
};

export default uploadHandler;
