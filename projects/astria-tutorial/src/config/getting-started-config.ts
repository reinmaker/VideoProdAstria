import type { ProductDemoConfig, VideoConfig } from './types';

// Actual audio durations (Samara X, eleven_multilingual_v2):
// 01-title:           5.4s  → scene 6s
// 02-what-is-astria: 13.1s  → scene 14s
// 03-dashboard:      25.5s  → scene 27s  (playbackRate 55.64/27 = 2.06)
// 04-concepts:       43.0s  → scene 44s
// 05-generate:       21.1s  → scene 23s  (playbackRate 49.9/23 = 2.2)
// 06-packs-concept:  20.2s  → scene 21s
// 07-packs-demo:     23.0s  → scene 24s  (playbackRate 36.5/24 = 1.5)
// 08-results:        12.0s  → scene 14s  (playbackRate 25.1/14 = 1.8)
// 09-cta:            19.9s  → scene 21s
// Total: 6+14+27+44+23+21+24+14+21 = 194s = 5820 frames

export const gettingStartedConfig: ProductDemoConfig = {
  product: {
    name: 'Astria',
    tagline: 'AI Fashion Image Generation',
    website: 'astria.ai',
  },

  scenes: [
    // Scene 01: Title (6s, audio 5.4s)
    {
      type: 'title',
      durationSeconds: 6,
      content: {
        headline: 'Getting Started with Astria',
        subheadline: 'Platform Overview · Prompts · References · Packs',
      },
    },

    // Scene 02: What is Astria (14s, audio 13.1s)
    {
      type: 'solution',
      durationSeconds: 14,
      content: {
        headline: 'What is Astria?',
        description: 'An AI image generation platform built for fashion brands and product teams.',
        highlights: [
          'Generate studio-quality photos from a text prompt',
          'Use real product references — not generic descriptions',
          'Organised by workspaces — one per brand or project',
        ],
      },
    },

    // Scene 03: Dashboard Tour (27s, audio 25.5s, playbackRate 2.0)
    {
      type: 'demo',
      durationSeconds: 27,
      content: {
        type: 'browser',
        videoFile: 'demos/gs-dashboard.mp4',
        label: 'The Sacks Workspace Dashboard',
        caption: 'Results grid · Workspace switcher · Prompt bar · AI assistant',
        playbackRate: 2.06,
      },
    },

    // Scene 04: Four Key Concepts (44s, audio 43.0s)
    {
      type: 'problem',
      durationSeconds: 44,
      content: {
        headline: 'Four Key Concepts',
        problems: [
          { icon: '🗂️', text: 'Workspace — a brand or project with its own product catalog' },
          { icon: '@',   text: 'Reference (tune) — a trained model of a specific product, added via @mention' },
          { icon: '✍️', text: 'Prompt — describe the scene; references provide the exact products' },
          { icon: '📦', text: 'Pack — a saved brand setup: prompt, references, and settings in one click' },
        ],
      },
    },

    // Scene 05: Prompt & Generate (23s, audio 21.1s, playbackRate 2.4)
    {
      type: 'demo',
      durationSeconds: 23,
      content: {
        type: 'browser',
        videoFile: 'demos/gs-generate.mp4',
        label: 'Writing a Prompt & Generating',
        caption: 'Type @ to open the reference picker → add product → write your scene → Generate',
        playbackRate: 2.2,
      },
    },

    // Scene 06: What are Packs? (21s, audio 20.2s)
    {
      type: 'solution',
      durationSeconds: 21,
      content: {
        headline: 'What are Packs?',
        description: 'Reusable brand setups for lookbooks, social drops, and full campaigns.',
        highlights: [
          'Each pack bundles a prompt, references, and generation settings',
          'Lookbook shoot, social drop, or campaign — one click to run',
          'Share across your team and build a library of recurring brand styles',
        ],
      },
    },

    // Scene 07: Packs Demo (24s, audio 23.0s, playbackRate 1.5)
    {
      type: 'demo',
      durationSeconds: 24,
      content: {
        type: 'browser',
        videoFile: 'demos/gs-packs.mp4',
        label: 'Packs — Sacks Workspace',
        caption: 'Lookbooks · social drops · campaigns · each pack pre-configured and ready to run',
        playbackRate: 1.5,
      },
    },

    // Scene 08: View Results (14s, audio 12.0s, playbackRate 2.1)
    {
      type: 'demo',
      durationSeconds: 14,
      content: {
        type: 'browser',
        videoFile: 'demos/gs-result.mp4',
        label: 'Viewing Your Results',
        caption: 'Click any image to open the full prompt detail — images, references, and settings',
        playbackRate: 1.8,
      },
    },

    // Scene 09: CTA (21s, audio 19.9s)
    {
      type: 'cta',
      durationSeconds: 21,
      content: {
        headline: "Your first AI photoshoot\nstarts with a prompt.",
        tagline: 'Continue with the Astria Academy · Sign up free at astria.ai',
        links: [
          { type: 'website', label: 'Get started free', url: 'astria.ai' },
        ],
      },
    },
  ],

  audio: {
    voiceoverFile: 'audio/gs-voiceover.mp3',
    voiceoverStartFrame: 0,
    backgroundMusicVolume: 0.10,
  },
};

export function calculateGSFrames(fps: number): number {
  return gettingStartedConfig.scenes.reduce((t, s) => t + s.durationSeconds * fps, 0);
}
