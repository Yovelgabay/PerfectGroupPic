// Attempt to load environment variables if the optional dependency exists.
// The server should still boot even if `dotenv` is not installed so that
// local development doesn't fail with a missing module error.
try {
  await import('dotenv/config');
} catch (err) {
  console.warn('dotenv not found – skipping .env loading');
}

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

// Load AWS Rekognition client lazily so the server can run without the
// `@aws-sdk/client-rekognition` package during local testing.
let RekognitionClient;
let DetectFacesCommand;
try {
  ({ RekognitionClient, DetectFacesCommand } = await import('@aws-sdk/client-rekognition'));
} catch (err) {
  console.warn('AWS SDK for Rekognition not installed – face detection disabled');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const uploadFolder = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadFolder),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(uploadFolder));

// Handle file uploads and return URLs to the uploaded files. If Multer
// encounters an error we return a 500 response instead of crashing the
// request which previously resulted in connection resets.
app.post('/api/upload', (req, res) => {
  upload.array('photos')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Failed to upload files' });
    }

    const files = req.files || [];
    const base = `${req.protocol}://${req.get('host')}`;
    const response = files.map((f) => ({
      url: `${base}/uploads/${f.filename}`,
      filename: f.originalname,
    }));
    res.json({ files: response });
  });
});

// Only initialise Rekognition if the SDK is available.
let rekognition;
if (RekognitionClient) {
  rekognition = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  });
}

app.post('/api/detect-faces', async (req, res) => {
  const { photoUrls } = req.body || {};
  if (!Array.isArray(photoUrls) || photoUrls.length === 0) {
    return res.status(400).json({ error: 'photoUrls must be an array' });
  }

  if (!rekognition || !DetectFacesCommand) {
    return res.status(500).json({ error: 'Face detection service unavailable' });
  }

  try {
    const faces = [];
    for (const url of photoUrls) {
      const resp = await fetch(url);
      const buffer = Buffer.from(await resp.arrayBuffer());
      const command = new DetectFacesCommand({
        Image: { Bytes: buffer },
        Attributes: ['DEFAULT']
      });
      const { FaceDetails = [] } = await rekognition.send(command);
      FaceDetails.forEach((detail, idx) => {
        const box = detail.BoundingBox || {};
        faces.push({
          face_id: `${url}-face-${idx}`,
          photo_url: url,
          coordinates: {
            x: (box.Left || 0) * 100,
            y: (box.Top || 0) * 100,
            width: (box.Width || 0) * 100,
            height: (box.Height || 0) * 100
          }
        });
      });
    }

    res.json({ faces });
  } catch (err) {
    console.error('DetectFaces error:', err);
    res.status(500).json({ error: 'Failed to detect faces' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
