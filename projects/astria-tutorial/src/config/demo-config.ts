import type { ProductDemoConfig, VideoConfig } from './types';

// Scene durations match actual voiceover audio lengths:
// Title: 5s (no narration)
// What is Astria: 15s (14.07s audio)
// What is a Reference: 21s (19.92s audio)
// Demo - References: 30s (22.1s audio, demo-references.mp4 = 30.08s)
// Demo - Settings & Generate: 25s (24.66s audio, demo-settings-generate.mp4 = 23s)
// Demo - Fullscreen Result: 20s (silent, demo-fullscreen.mp4 = 19.44s)
// CTA: 9s (7.24s audio)

export const demoConfig: ProductDemoConfig = {
  product: {
    name: 'Astria',
    tagline: 'AI Fashion Image Generation',
    website: 'astria.ai',
  },

  scenes: [
    // Title Scene
    {
      type: 'title',
      durationSeconds: 5,
      content: {
        headline: 'How to Generate a Lookbook in Astria',
        subheadline: 'References · Workspaces · 4K Output',
      },
    },

    // What is Astria
    {
      type: 'solution',
      durationSeconds: 15,
      content: {
        headline: 'What is Astria?',
        description: 'An AI image generation platform built for fashion and product workflows.',
        highlights: [
          'Studio-quality photos of clothing & accessories',
          'Uses your own product images as source of truth',
          'Full outfit generation from individual items',
        ],
      },
    },

    // What is a Reference
    {
      type: 'problem',
      durationSeconds: 21,
      content: {
        headline: 'What is a Reference?',
        problems: [
          { icon: '🎯', text: 'A trained model built from photos of a specific product' },
          { icon: '@', text: 'Added via @mention — opens the workspace product picker' },
          { icon: '✓', text: 'Generates the exact item — not a generic approximation' },
        ],
      },
    },

    // Demo — Workspace & References
    {
      type: 'demo',
      durationSeconds: 30,
      content: {
        type: 'browser',
        videoFile: 'demos/demo-references.mp4',
        label: 'Selecting Workspace & Adding References',
        caption: 'Sloane · shirt (front) · pants · shoes — each chip = a real product',
      },
    },

    // Demo — Settings & Generate
    {
      type: 'demo',
      durationSeconds: 25,
      content: {
        type: 'browser',
        videoFile: 'demos/demo-settings-generate.mp4',
        label: 'Configure & Generate',
        caption: 'Nano Banana 2 · 3:4 ratio · 4K resolution · 2 images → Generate',
      },
    },

    // Demo — Fullscreen Result
    {
      type: 'demo',
      durationSeconds: 20,
      content: {
        type: 'browser',
        videoFile: 'demos/demo-fullscreen.mp4',
        label: 'Prompt Detail — Result & References',
        caption: 'Two 4K lookbook photos · full prompt · 4 reference chips',
      },
    },

    // CTA
    {
      type: 'cta',
      durationSeconds: 9,
      content: {
        headline: 'For your next photoshoot,\nyou don\'t need a studio.',
        tagline: 'You need a prompt. Astria AI — your AI fashion platform.',
        links: [
          { type: 'website', label: 'Get started', url: 'astria.ai' },
        ],
      },
    },
  ],

  audio: {
    voiceoverFile: 'audio/voiceover.mp3',
    voiceoverStartFrame: 0,
    backgroundMusicVolume: 0.10,
  },
};

// Video settings — 1920×1080 @ 30fps
export const videoConfig: VideoConfig = {
  fps: 30,
  width: 1920,
  height: 1080,
};

// Calculate total duration from scenes
export function calculateTotalFrames(config: ProductDemoConfig, fps: number): number {
  return config.scenes.reduce((total, scene) => {
    return total + scene.durationSeconds * fps;
  }, 0);
}
