import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import { RekognitionClient, DetectFacesCommand } from '@aws-sdk/client-rekognition';

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

app.post('/api/upload', upload.array('photos'), (req, res) => {
  const files = req.files || [];
  const base = `${req.protocol}://${req.get('host')}`;
  const response = files.map((f) => ({
    url: `${base}/uploads/${f.filename}`,
    filename: f.originalname,
  }));
  res.json({ files: response });
});

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

app.post('/api/detect-faces', async (req, res) => {
  const { photoUrls } = req.body || {};
  if (!Array.isArray(photoUrls) || photoUrls.length === 0) {
    return res.status(400).json({ error: 'photoUrls must be an array' });
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
