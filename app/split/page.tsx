'use client';

import { useState } from 'react';
import { downloadBlob, downloadZip } from '@/lib/download';

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [slices, setSlices] = useState(5);
  const [previews, setPreviews] = useState<string[]>([]);

  const processImage = async (input = file) => {
    if (!input) return;
    const image = await fileToImage(input);
    const results = splitImage(image, slices);
    setPreviews(results.map((canvas) => canvas.toDataURL('image/png')));
  };

  const downloadAll = async () => {
    const items = await Promise.all(
      previews.map(async (dataUrl, i) => {
        const blob = await (await fetch(dataUrl)).blob();
        return { filename: `slice-${i + 1}.png`, blob };
      })
    );
    await downloadZip(items, 'creatorkit-slices.zip');
  };

  const downloadOne = async (url: string, i: number) => {
    const blob = await (await fetch(url)).blob();
    downloadBlob(blob, `slice-${i + 1}.png`);
  };

  return (
    <main className="grid gap-6 lg:grid-cols-[330px_1fr]">
      <section className="card space-y-4 p-5">
        <h1 className="text-2xl font-semibold">Image Splitter</h1>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const uploaded = e.target.files?.[0] ?? null;
            setFile(uploaded);
            void processImage(uploaded);
          }}
        />
        <label className="text-sm text-slate-300">Slices: {slices}</label>
        <input type="range" min={3} max={10} value={slices} onChange={(e) => setSlices(Number(e.target.value))} />
        <button className="btn w-full" onClick={() => processImage()} disabled={!file}>
          Preview Slices
        </button>
        <button className="btn w-full" onClick={downloadAll} disabled={!previews.length}>
          Download ZIP
        </button>
      </section>
      <section className="card p-5">
        <div className="grid gap-4 md:grid-cols-2">
          {previews.map((preview, i) => (
            <article key={preview} className="space-y-2 rounded-xl border border-slate-700 p-3">
              <img src={preview} alt={`Slice ${i + 1}`} className="w-full rounded-lg" />
              <button className="btn w-full" onClick={() => void downloadOne(preview, i)}>
                Download
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const splitImage = (image: HTMLImageElement, parts: number) => {
  const targetWidth = 1080;
  const scale = targetWidth / image.width;
  const scaledHeight = image.height * scale;
  const sliceHeight = scaledHeight / parts;

  return Array.from({ length: parts }, (_, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = Math.round(sliceHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.drawImage(
      image,
      0,
      (index * sliceHeight) / scale,
      image.width,
      sliceHeight / scale,
      0,
      0,
      targetWidth,
      sliceHeight
    );

    return canvas;
  });
};

const fileToImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
