import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  topic: z.string().min(3),
  slides: z.number().min(3).max(10),
  tone: z.enum(['educational', 'motivational', 'storytelling'])
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 400 });
    }

    const prompt = `Generate an Instagram carousel.\n\nTopic: ${payload.topic}\n\nCreate ${payload.slides} slides.\n\nTone: ${payload.tone}\n\nStructure:\nSlide 1: Viral hook\nSlides 2..n-1: Key points\nLast slide: Call to action\n\nReturn JSON format:\n[\n{ "title": "Slide title", "text": "Slide description" }\n]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);

    return NextResponse.json({ slides: parsed });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate carousel', detail: String(error) }, { status: 500 });
  }
}
