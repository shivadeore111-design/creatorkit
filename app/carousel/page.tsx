'use client';

import { useRef, useState } from 'react';
import { canvasToBlob, downloadBlob, downloadZip } from '@/lib/download';
import { renderSlide } from '@/lib/canvas';
import type { SlideContent, StylePreset, Tone } from '@/lib/types';

export default function CarouselPage() {
  const [topic, setTopic] = useState('5 habits that changed my life');
  const [slidesCount, setSlidesCount] = useState(7);
  const [tone, setTone] = useState<Tone>('motivational');
  const [style, setStyle] = useState<StylePreset>('bold');
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = async () => {
    setLoading(true);
    const response = await fetch('/api/carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, slides: slidesCount, tone })
    });
    const data = await response.json();
    setSlides(data.slides ?? []);
    setLoading(false);
  };

  const exportSlide = async (slide: SlideContent, idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderSlide(canvas, slide, style);
    const blob = await canvasToBlob(canvas);
    downloadBlob(blob, `slide-${idx + 1}.png`);
  };

  const exportAll = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !slides.length) return;
    const items: { filename: string; blob: Blob }[] = [];

    for (let i = 0; i < slides.length; i += 1) {
      renderSlide(canvas, slides[i], style);
      const blob = await canvasToBlob(canvas);
      items.push({ filename: `slide-${i + 1}.png`, blob });
    }

    await downloadZip(items, 'creatorkit-carousel.zip');
  };

  return (
    <main className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="card space-y-4 p-5">
        <h1 className="text-2xl font-semibold">AI Carousel Generator</h1>
        <input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" />
        <label className="block text-sm text-slate-300">Slides: {slidesCount}</label>
        <input
          className="w-full"
          type="range"
          min={3}
          max={10}
          value={slidesCount}
          onChange={(e) => setSlidesCount(Number(e.target.value))}
        />
        <select className="select" value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
          <option value="educational">Educational</option>
          <option value="motivational">Motivational</option>
          <option value="storytelling">Storytelling</option>
        </select>
        <select className="select" value={style} onChange={(e) => setStyle(e.target.value as StylePreset)}>
          <option value="minimal">Minimal</option>
          <option value="bold">Bold</option>
          <option value="dark">Dark</option>
        </select>
        <button className="btn w-full" onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Carousel'}
        </button>
        <button className="btn w-full" onClick={exportAll} disabled={!slides.length}>
          Download ZIP
        </button>
      </section>

      <section className="card p-5">
        <canvas ref={canvasRef} width={1080} height={1080} className="hidden" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {slides.map((slide, idx) => (
            <article key={`${slide.title}-${idx}`} className="rounded-xl border border-slate-700 p-4">
              <h3 className="font-semibold">{slide.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{slide.text}</p>
              <button className="btn mt-4" onClick={() => exportSlide(slide, idx)}>
                Download PNG
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
