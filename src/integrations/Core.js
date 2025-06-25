// src/integrations/Core.js
// Upload an array of files to the backend
export async function UploadFiles(files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('photos', file);
  }

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error('Failed to upload files');
  }

  const data = await res.json();
  return data.files;
}

// Legacy single-file uploader API
export const UploadFile = async (file) => {
  const [result] = await UploadFiles([file]);
  return result;
};

// Call a face recognition API (e.g. AWS Rekognition, Face++, Azure)
// This implementation uses a generic REST endpoint with placeholder
// credentials to illustrate how to integrate a real service.
export async function InvokeLLM({ file_urls }) {
  const apiEndpoint = 'https://example-face-api.com/detect'; // placeholder URL
  const apiKey = 'YOUR_API_KEY'; // replace with your real key

  const requests = file_urls.map(async (url) => {
    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ image_url: url })
    });

    if (!res.ok) {
      throw new Error('Face detection request failed');
    }

    return res.json();
  });

  const results = await Promise.all(requests);

  // Flatten and normalize faces from all photos
  const faces = results.flatMap((r, index) =>
    (r.faces || []).map((face, i) => ({
      face_id: `${file_urls[index]}-face-${i}`,
      photo_url: file_urls[index],
      coordinates: {
        x: face.box.x,
        y: face.box.y,
        width: face.box.width,
        height: face.box.height
      }
    }))
  );

  return { faces };
}
