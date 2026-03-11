'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import type { EditorSettings } from '@/lib/types';
import { canvasToBlob, downloadBlob } from '@/lib/download';
import { applyWatermark } from '@/lib/watermark';

const initialSettings: EditorSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  skinSmooth: 0,
  faceSlim: 0,
  eyeSize: 0,
  teethWhiten: 0
};

export default function EditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<EditorSettings>(initialSettings);
  const [status, setStatus] = useState('Upload an image to start editing.');
  const [detections, setDetections] = useState<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        setStatus('Models loaded. Upload an image.');
      } catch {
        setStatus('Face model files are missing in /public/models. Filters still work without landmarks.');
      }
    };
    void loadModels();
  }, []);

  useEffect(() => {
    if (!baseImageRef.current) return;
    render();
  }, [settings, detections]);

  const sliders = useMemo(
    () => [
      { key: 'skinSmooth', label: 'Skin smooth', min: 0, max: 20 },
      { key: 'brightness', label: 'Brightness', min: 50, max: 150 },
      { key: 'contrast', label: 'Contrast', min: 50, max: 150 },
      { key: 'saturation', label: 'Saturation', min: 50, max: 150 },
      { key: 'blur', label: 'Blur', min: 0, max: 10 },
      { key: 'faceSlim', label: 'Face slim', min: 0, max: 20 },
      { key: 'eyeSize', label: 'Eye size', min: 0, max: 20 },
      { key: 'teethWhiten', label: 'Teeth whiten', min: 0, max: 30 }
    ],
    []
  );

  const loadFile = async (uploaded: File) => {
    setFile(uploaded);
    const image = await fileToImage(uploaded);
    baseImageRef.current = image;
    setStatus('Running face detection...');

    try {
      const found = await faceapi
        .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      setDetections(found);
      setStatus(found.length ? `Detected ${found.length} face(s).` : 'No faces detected. Basic filters available.');
    } catch {
      setStatus('Could not run face detection. Basic filters are still available.');
    }

    render(image);
  };

  const render = (image = baseImageRef.current) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;

    const ratio = Math.min(1080 / image.width, 1080 / image.height);
    const drawW = image.width * ratio;
    const drawH = image.height * ratio;
    const x = (1080 - drawW) / 2;
    const y = (1080 - drawH) / 2;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) blur(${settings.blur}px)`;
    ctx.drawImage(image, x, y, drawW, drawH);
    ctx.filter = 'none';

    if (settings.skinSmooth > 0 || settings.teethWhiten > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(settings.skinSmooth / 100 + settings.teethWhiten / 150, 0.35);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, drawW, drawH);
      ctx.restore();
    }

    if (detections.length) {
      ctx.save();
      ctx.strokeStyle = 'rgba(99,102,241,0.6)';
      ctx.lineWidth = 2;
      detections.forEach((det) => {
        const box = det.detection.box;
        ctx.strokeRect(x + box.x * ratio, y + box.y * ratio, box.width * ratio, box.height * ratio);
      });
      ctx.restore();
    }

    applyWatermark(ctx, 1080, 1080, false);
  };

  const download = async () => {
    if (!canvasRef.current) return;
    const blob = await canvasToBlob(canvasRef.current);
    downloadBlob(blob, 'edited-photo.png');
  };

  return (
    <main className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="card space-y-4 p-5">
        <h1 className="text-2xl font-semibold">Photo Editor</h1>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const uploaded = e.target.files?.[0];
            if (uploaded) {
              void loadFile(uploaded);
            }
          }}
        />
        <p className="text-xs text-slate-400">{status}</p>

        {sliders.map((slider) => (
          <label key={slider.key} className="block">
            <span className="mb-1 block text-sm text-slate-300">
              {slider.label}: {settings[slider.key as keyof EditorSettings]}
            </span>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              value={settings[slider.key as keyof EditorSettings]}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  [slider.key]: Number(e.target.value)
                }))
              }
            />
          </label>
        ))}

        <button className="btn w-full" onClick={() => setSettings(initialSettings)} disabled={!file}>
          Reset
        </button>
        <button className="btn w-full" onClick={download} disabled={!file}>
          Download PNG
        </button>
      </section>

      <section className="card p-5">
        <canvas ref={canvasRef} width={1080} height={1080} className="mx-auto w-full max-w-2xl rounded-xl border border-slate-700" />
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
