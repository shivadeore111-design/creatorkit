'use client';

import { useRef, useState } from 'react';
import { canvasToBlob, downloadBlob } from '@/lib/download';
import { applyWatermark } from '@/lib/watermark';

type BgMode = 'blur' | 'solid' | 'gradient';

export default function SquarePage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<BgMode>('blur');
  const [solidColor, setSolidColor] = useState('#111827');
  const [gradientA, setGradientA] = useState('#312e81');
  const [gradientB, setGradientB] = useState('#7c3aed');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = async (input = file) => {
    if (!input || !canvasRef.current) return;
    const image = await fileToImage(input);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;

    if (mode === 'blur') {
      ctx.filter = 'blur(28px) brightness(70%)';
      drawCover(ctx, image, canvas.width, canvas.height);
      ctx.filter = 'none';
    } else if (mode === 'solid') {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, 1080, 1080);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      gradient.addColorStop(0, gradientA);
      gradient.addColorStop(1, gradientB);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);
    }

    drawContain(ctx, image, 1080, 1080);
    applyWatermark(ctx, 1080, 1080, false);
    setPreviewUrl(canvas.toDataURL('image/png'));
  };

  const download = async () => {
    if (!canvasRef.current) return;
    const blob = await canvasToBlob(canvasRef.current);
    downloadBlob(blob, 'square-fit.png');
  };

  return (
    <main className="grid gap-6 lg:grid-cols-[330px_1fr]">
      <section className="card space-y-4 p-5">
        <h1 className="text-2xl font-semibold">Square Fit Tool</h1>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const uploaded = e.target.files?.[0] ?? null;
            setFile(uploaded);
            void draw(uploaded);
          }}
        />
        <select className="select" value={mode} onChange={(e) => setMode(e.target.value as BgMode)}>
          <option value="blur">Blur background</option>
          <option value="solid">Solid color</option>
          <option value="gradient">Gradient</option>
        </select>
        {mode === 'solid' && <input type="color" value={solidColor} onChange={(e) => setSolidColor(e.target.value)} />}
        {mode === 'gradient' && (
          <div className="flex gap-3">
            <input type="color" value={gradientA} onChange={(e) => setGradientA(e.target.value)} />
            <input type="color" value={gradientB} onChange={(e) => setGradientB(e.target.value)} />
          </div>
        )}
        <button className="btn w-full" onClick={() => draw()} disabled={!file}>
          Refresh Preview
        </button>
        <button className="btn w-full" onClick={download} disabled={!previewUrl}>
          Download PNG
        </button>
      </section>
      <section className="card p-5">
        <canvas ref={canvasRef} className="hidden" />
        {previewUrl ? (
          <img src={previewUrl} alt="Square preview" className="mx-auto w-full max-w-xl rounded-xl border border-slate-700" />
        ) : (
          <p className="text-slate-400">Upload an image to preview your square post.</p>
        )}
      </section>
    </main>
  );
}

const fileToImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });

const drawContain = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) => {
  const ratio = Math.min(width / image.width, height / image.height);
  const drawW = image.width * ratio;
  const drawH = image.height * ratio;
  const x = (width - drawW) / 2;
  const y = (height - drawH) / 2;
  ctx.drawImage(image, x, y, drawW, drawH);
};

const drawCover = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) => {
  const ratio = Math.max(width / image.width, height / image.height);
  const drawW = image.width * ratio;
  const drawH = image.height * ratio;
  const x = (width - drawW) / 2;
  const y = (height - drawH) / 2;
  ctx.drawImage(image, x, y, drawW, drawH);
};
