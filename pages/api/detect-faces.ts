import type { NextApiRequest, NextApiResponse } from 'next';
import { RekognitionClient, DetectFacesCommand } from '@aws-sdk/client-rekognition';

const client = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { photoUrls } = req.body as { photoUrls?: string[] };
  if (!Array.isArray(photoUrls) || photoUrls.length === 0) {
    res.status(400).json({ error: 'photoUrls must be an array' });
    return;
  }

  try {
    const faces: any[] = [];

    for (const url of photoUrls) {
      const resp = await fetch(url);
      const buffer = Buffer.from(await resp.arrayBuffer());
      const command = new DetectFacesCommand({
        Image: { Bytes: buffer },
        Attributes: ['DEFAULT']
      });
      const { FaceDetails = [] } = await client.send(command);
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

    res.status(200).json({ faces });
  } catch (err) {
    console.error('DetectFaces error:', err);
    res.status(500).json({ error: 'Failed to detect faces' });
  }
}
