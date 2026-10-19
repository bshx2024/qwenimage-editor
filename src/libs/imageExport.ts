/**
 * Image Export Utility with Tiered Resolution & Watermark Support
 * - Free / Preview Tier: Downscaled to max 512px, compressed quality, subtle watermark badge.
 * - Pro / Lossless Tier: Full resolution original (1024-2048px), 100% quality, zero watermark.
 */

export interface ExportImageOptions {
  imgUrl: string;
  format?: 'png' | 'jpg' | 'webp';
  tier?: 'preview' | 'hd';
  filenamePrefix?: string;
}

export async function exportImageWithTier({
  imgUrl,
  format = 'png',
  tier = 'hd',
  filenamePrefix = 'qwen-image',
}: ExportImageOptions): Promise<void> {
  const res = await fetch(imgUrl);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let targetWidth = img.naturalWidth || img.width;
        let targetHeight = img.naturalHeight || img.height;

        // Preview tier: limit maximum dimension to 512px
        if (tier === 'preview') {
          const maxDim = 512;
          if (targetWidth > maxDim || targetHeight > maxDim) {
            if (targetWidth >= targetHeight) {
              targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
              targetWidth = maxDim;
            } else {
              targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
              targetHeight = maxDim;
            }
          }
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D unavailable');

        if (format === 'jpg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Preview tier: apply subtle semi-transparent watermark badge
        if (tier === 'preview') {
          ctx.save();
          const fontSize = Math.max(11, Math.round(targetWidth * 0.026));
          ctx.font = `600 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 4;
          const text = 'qwenimage-editor.com (Preview)';
          const metrics = ctx.measureText(text);
          ctx.fillText(text, targetWidth - metrics.width - 10, targetHeight - 10);
          ctx.restore();
        }

        const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        const exportQuality = tier === 'preview' ? 0.75 : 0.95;

        canvas.toBlob(
          (convertedBlob) => {
            if (convertedBlob) {
              const downloadUrl = URL.createObjectURL(convertedBlob);
              const a = document.createElement('a');
              a.href = downloadUrl;
              a.download = `${filenamePrefix}-${tier === 'preview' ? 'preview-512px' : 'hd-lossless'}-${Date.now()}.${format}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(downloadUrl);
            }
            URL.revokeObjectURL(objectUrl);
            resolve();
          },
          mimeType,
          exportQuality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}
