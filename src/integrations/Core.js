export async function UploadFile({ file }) {
  return { file_url: URL.createObjectURL(file) };
}

export async function InvokeLLM() {
  return { faces: [] };
}
