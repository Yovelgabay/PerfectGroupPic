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

export async function InvokeLLM({ prompt, file_urls, response_json_schema }) {
  // TODO: חיבור ל-OpenAI / Anthropic / HuggingFace וכו'
  // כרגע מחזיר תוצאה דמה ללא פייסים כדי שהקוד ירוץ
  return { faces: [] };
}
