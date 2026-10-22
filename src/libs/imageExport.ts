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

/**
 * Generate a branded 1200x630 social comparison card (Before vs After) for viral sharing
 */
export async function exportComparisonCard({
  beforeUrl,
  afterUrl,
  title = 'Qwen Image Editor — AI Inpainting',
}: {
  beforeUrl: string;
  afterUrl: string;
  title?: string;
}): Promise<void> {
  const loadImg = (url: string): Promise<HTMLImageElement> => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = objUrl;
      } catch (e) {
        reject(e);
      }
    });
  };

  const [beforeImg, afterImg] = await Promise.all([loadImg(beforeUrl), loadImg(afterUrl)]);

  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 630;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Background
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, 0, width, height);

  // Top header bar
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, width, 54);

  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('⚡ ' + title, 24, 35);

  ctx.font = '14px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('qwenimage-editor.com', width - 200, 35);

  // Images display area: y=54 to y=576 (height 522px)
  const imgY = 64;
  const imgH = 506;
  const gap = 12;
  const imgW = (width - 48 - gap) / 2; // (1200 - 48 - 12) / 2 = 570px

  const drawCover = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let sW = img.width;
    let sH = img.height;
    let sX = 0;
    let sY = 0;

    if (imgRatio > boxRatio) {
      sW = img.height * boxRatio;
      sX = (img.width - sW) / 2;
    } else {
      sH = img.width / boxRatio;
      sY = (img.height - sH) / 2;
    }
    ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h);
  };

  // Draw before
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(24, imgY, imgW, imgH, 12);
  ctx.clip();
  drawCover(beforeImg, 24, imgY, imgW, imgH);
  ctx.restore();

  // Draw after
  const afterX = 24 + imgW + gap;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(afterX, imgY, imgW, imgH, 12);
  ctx.clip();
  drawCover(afterImg, afterX, imgY, imgW, imgH);
  ctx.restore();

  // Badges: "BEFORE" on left, "AI EDITED" on right
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(36, imgY + 14, 80, 28);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('BEFORE', 50, imgY + 33);

  ctx.fillStyle = '#10b981';
  ctx.fillRect(afterX + 12, imgY + 14, 110, 28);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('✨ AI EDITED', afterX + 22, imgY + 33);

  // Center arrow pill
  const centerX = width / 2;
  const centerY = imgY + imgH / 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#6366f1';
  ctx.fill();
  ctx.strokeStyle = '#0b0f19';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('➔', centerX, centerY);

  // Bottom footer strip
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, height - 48, width, 48);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Transform photos with conversational prompts • Powered by Qwen-Image 2.1', 24, height - 19);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('Free Online AI Editor: qwenimage-editor.com', width - 24, height - 19);

  // Export blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `qwen-before-after-comparison-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }
      resolve();
    }, 'image/png');
  });
}

