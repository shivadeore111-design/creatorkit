export type Tone = 'educational' | 'motivational' | 'storytelling';
export type StylePreset = 'minimal' | 'bold' | 'dark';

export interface SlideContent {
  title: string;
  text: string;
}

export interface EditorSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  skinSmooth: number;
  faceSlim: number;
  eyeSize: number;
  teethWhiten: number;
}
