import JSZip from 'jszip';

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to generate PNG export.'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });

export const downloadZip = async (items: { filename: string; blob: Blob }[], zipName: string) => {
  const zip = new JSZip();
  items.forEach((item) => zip.file(item.filename, item.blob));
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, zipName);
};
