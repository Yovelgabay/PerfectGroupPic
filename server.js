import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

app.use('/uploads', express.static(uploadFolder));

app.post('/api/upload', upload.array('photos'), (req, res) => {
  const files = req.files || [];
  const response = files.map(f => ({
    url: `/uploads/${f.filename}`,
    filename: f.originalname,
  }));
  res.json({ files: response });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
