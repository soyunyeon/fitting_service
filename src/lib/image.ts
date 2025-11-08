export async function looksLikeJpeg(file: File) {
  const head = new Uint8Array(await file.slice(0, 3).arrayBuffer());
  const tail = new Uint8Array(await file.slice(-2).arrayBuffer());
  const hasSOI = head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF; // FF D8 FF
  const hasEOI = tail[0] === 0xFF && tail[1] === 0xD9;                      // FF D9
  return hasSOI && hasEOI;
}

/** 브라우저가 이해 가능한 포맷이면 캔버스로 강제 JPEG 재인코딩 */
export async function normalizeToJpeg(original: File): Promise<File> {
  try {
    if (original.type === 'image/jpeg' && await looksLikeJpeg(original)) return original;

    // Blob -> ImageBitmap
    const blob = new Blob([await original.arrayBuffer()]);
    const bmp = await createImageBitmap(blob);

    // draw & re-encode
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bmp, 0, 0);

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 0.92);
    });

    const safeName = (original.name.split('.').slice(0, -1).join('.') || 'upload') + '.jpg';
    const file = new File([jpegBlob], safeName, { type: 'image/jpeg' });
    return file;
  } catch (e) {
    console.warn('normalizeToJpeg 실패, 원본 그대로 사용:', e);
    return original; // 마지막 보루
  }
}
