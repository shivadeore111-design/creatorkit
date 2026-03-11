import { Crop, Images, Sparkles, Wand2 } from 'lucide-react';
import { ToolCard } from '@/components/tool-card';

const tools = [
  {
    title: 'AI Carousel Generator',
    description: 'Generate viral Instagram carousels from a single topic using Gemini Flash.',
    href: '/carousel',
    icon: Sparkles
  },
  {
    title: 'Square Fit Tool',
    description: 'Convert any image to 1080x1080 with blur, color, or gradient backgrounds.',
    href: '/square',
    icon: Crop
  },
  {
    title: 'Image Splitter',
    description: 'Split long images into Instagram-ready carousel slices and export a ZIP.',
    href: '/split',
    icon: Images
  },
  {
    title: 'Photo Editor',
    description: 'Retouch photos with face-aware controls and instant filter previews.',
    href: '/editor',
    icon: Wand2
  }
];

export default function HomePage() {
  return (
    <main className="space-y-8">
      <section className="card p-8">
        <p className="text-sm uppercase tracking-wide text-brand-500">Instagram Creator Suite</p>
        <h1 className="mt-2 text-4xl font-bold">Build and export Instagram-ready content in minutes.</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          CreatorKit combines AI content generation, square conversion, image splitting, and photo retouching in one modern
          web app.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <ToolCard key={tool.title} {...tool} />
        ))}
      </section>
    </main>
  );
}
