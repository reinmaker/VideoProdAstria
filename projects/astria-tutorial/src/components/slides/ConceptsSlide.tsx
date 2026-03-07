/**
 * ConceptsSlide — animated spotlight component for the Four Key Concepts scene.
 *
 * Each concept takes the stage one at a time:
 *   - Active concept: full color, expanded card with supporting description
 *   - Inactive concepts: dimmed, compact row
 * Transitions are smooth cross-fades keyed to narration timing.
 */
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { useTheme } from '../../config/theme';
import type { ProblemContent } from '../../config/types';

// Per-concept accent colors
const COLORS = ['#3B82F6', '#7C3AED', '#10B981', '#F59E0B'];

// Supporting descriptions shown while each concept is spoken about
const DESCRIPTIONS = [
  'Keep every brand and project in its own space — its own references, prompts, and generated images.',
  'Train once on any product. Then @mention it in any prompt to get that exact item, consistent every time.',
  'Write the scene in plain language. References handle the exact products — you write the story.',
  'Save a prompt, references, and settings as one template. Run entire lookbooks or campaigns in one click.',
];

// Frame boundaries where each concept becomes the spotlight
// Scene = 44s = 1320 frames @ 30fps; audio = 42.96s
// Narration timing (estimated):
//   0-45f  : "Four concepts to know."
//   45-285f: Workspace (~8s)
//   285-735f: References (~15s)
//   735-945f: Prompts (~7s)
//   945-1230f: Packs (~9.5s)
//   1230-1320f: outro
const SPOTLIGHT: [number, number][] = [
  [45,  285],  // Workspace
  [285, 735],  // References
  [735, 945],  // Prompts
  [945, 1230], // Packs
];
const TRANSITION = 18; // frames for cross-fade

interface ConceptsSlideProps {
  content: ProblemContent;
}

export const ConceptsSlide: React.FC<ConceptsSlideProps> = ({ content }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();

  // 0-1 focus strength for each concept
  const focusOf = (i: number) => {
    const [start, end] = SPOTLIGHT[i];
    return interpolate(frame, [start - TRANSITION, start, end, end + TRANSITION], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  // Title fade in
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 100px',
        gap: 0,
      }}
    >
      {/* Headline */}
      <h2
        style={{
          fontSize: 52,
          fontWeight: 800,
          fontFamily: theme.fonts.primary,
          color: theme.colors.textDark,
          opacity: titleOp,
          margin: '0 0 40px 0',
          letterSpacing: '-1px',
        }}
      >
        {content.headline}
      </h2>

      {/* Concepts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
        {content.problems.map((problem, i) => {
          const focus = focusOf(i);
          const color = COLORS[i];
          const desc = DESCRIPTIONS[i];

          // Inactive style interpolation
          const bgAlpha = interpolate(focus, [0, 1], [0.04, 0.14]);
          const borderAlpha = interpolate(focus, [0, 1], [0.12, 0.8]);
          const textOp = interpolate(focus, [0, 1], [0.3, 1]);
          const iconScale = interpolate(focus, [0, 1], [0.7, 1]);

          // Height: inactive = 72px, active = ~220px
          const cardHeight = interpolate(focus, [0, 1], [72, 215]);
          const descOp = interpolate(focus, [0, 0.5, 1], [0, 0, 1]);
          const descY = interpolate(focus, [0, 1], [10, 0]);

          return (
            <div
              key={i}
              style={{
                background: `rgba(${hexToRgb(color)}, ${bgAlpha})`,
                border: `2px solid rgba(${hexToRgb(color)}, ${borderAlpha})`,
                borderRadius: 18,
                padding: '0 28px',
                height: cardHeight,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'none',
              }}
            >
              {/* Row: icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 14,
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    flexShrink: 0,
                    opacity: textOp,
                    transform: `scale(${iconScale})`,
                  }}
                >
                  {problem.icon}
                </div>
                <span
                  style={{
                    color: theme.colors.textDark,
                    fontSize: interpolate(focus, [0, 1], [22, 30]),
                    fontWeight: interpolate(focus, [0, 1], [500, 700]),
                    fontFamily: theme.fonts.primary,
                    opacity: textOp,
                    letterSpacing: '-0.3px',
                  }}
                >
                  {problem.text}
                </span>
              </div>

              {/* Description — only visible when active */}
              <div
                style={{
                  opacity: descOp,
                  transform: `translateY(${descY}px)`,
                  marginTop: 14,
                  marginLeft: 78,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: theme.colors.textDark,
                    fontSize: 22,
                    fontFamily: theme.fonts.primary,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    opacity: 0.75,
                  }}
                >
                  {desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Utility: convert hex color to "r, g, b" string for rgba()
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
