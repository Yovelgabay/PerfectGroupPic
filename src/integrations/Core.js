// src/integrations/Core.js
export async function UploadFile(file) {
  // TODO: חבר ל-backend אמיתי
  // מחזיר אובייקט דמה בדומה למה ש-Upload.jsx מצפה
  return {
    url: URL.createObjectURL(file),
    filename: file.name,
  };
}

export async function InvokeLLM({ prompt, file_urls, response_json_schema }) {
  // TODO: חיבור ל-OpenAI / Anthropic / HuggingFace וכו'
  // כרגע מחזיר תוצאה דמה ללא פייסים כדי שהקוד ירוץ
  return { faces: [] };
}
