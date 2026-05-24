import { supabase } from '@/lib/supabase';

async function upload({
  url,
  buffer,
  base64,
  bucket = 'uploads',
  path
}) {
  try {
    let fileData;
    let fileName;
    let contentType;

    if (buffer) {
      fileName = path || `upload-${Date.now()}.bin`;
      contentType = 'application/octet-stream';
      fileData = buffer;
    } else if (base64) {
      fileName = path || `upload-${Date.now()}.txt`;
      contentType = 'text/plain';
      fileData = base64;
    } else if (url) {
      const response = await fetch(url);
      const blob = await response.blob();
      fileName = path || `upload-${Date.now()}.${blob.type.split('/')[1] || 'bin'}`;
      contentType = blob.type;
      fileData = blob;
    } else {
      throw new Error('Either buffer, base64, or url must be provided');
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileData, {
        contentType,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      url: publicUrl,
      mimeType: contentType
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export { upload };
export default upload;