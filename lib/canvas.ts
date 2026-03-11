import { SlideContent, StylePreset } from './types';
import { applyWatermark } from './watermark';

const STYLE_MAP: Record<StylePreset, [string, string]> = {
  minimal: ['#111827', '#1f2937'],
  bold: ['#4338ca', '#7c3aed'],
  dark: ['#020617', '#1e1b4b']
};

export const createSquareCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  return canvas;
};

export const renderSlide = (
  canvas: HTMLCanvasElement,
  slide: SlideContent,
  style: StylePreset,
  isPremium = false
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  const [start, end] = STYLE_MAP[style];
  gradient.addColorStop(0, start);
  gradient.addColorStop(1, end);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';

  ctx.font = '700 68px Inter, sans-serif';
  wrapText(ctx, slide.title, 540, 220, 900, 86);

  ctx.font = '400 46px Inter, sans-serif';
  wrapText(ctx, slide.text, 540, 460, 860, 64);

  applyWatermark(ctx, canvas.width, canvas.height, isPremium);
};

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) => {
  const words = text.split(' ');
  let line = '';
  let cursorY = y;

  for (let i = 0; i < words.length; i += 1) {
    const testLine = `${line + words[i]} `;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, cursorY);
      line = `${words[i]} `;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, cursorY);
};
