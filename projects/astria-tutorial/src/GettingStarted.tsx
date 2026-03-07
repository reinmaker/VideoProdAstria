import { AbsoluteFill, Series, Audio, staticFile, Sequence } from 'remotion';
import { ThemeProvider, defaultTheme } from './config/theme';
import { gettingStartedConfig, calculateGSFrames } from './config/getting-started-config';
import { videoConfig } from './config/demo-config';
import { AnimatedBackground, Vignette, LogoWatermark } from './components/core';
import {
  TitleSlide,
  ConceptsSlide,
  SolutionSlide,
  DemoSlide,
  StatsSlide,
  CTASlide,
} from './components/slides';
import type {
  TitleContent,
  ProblemContent,
  SolutionContent,
  DemoContent,
  StatsContent,
  CTAContent,
} from './config/types';

const cfg = gettingStartedConfig;

export const GettingStarted: React.FC = () => {
  const { fps } = videoConfig;

  return (
    <ThemeProvider theme={defaultTheme}>
      <AbsoluteFill
        style={{
          backgroundColor: defaultTheme.colors.bgLight,
          fontFamily: defaultTheme.fonts.primary,
        }}
      >
        <AnimatedBackground />

        {/* Background Music */}
        {cfg.audio?.backgroundMusicFile && (
          <Audio
            src={staticFile(cfg.audio.backgroundMusicFile)}
            volume={cfg.audio.backgroundMusicVolume || 0.12}
            startFrom={0}
          />
        )}

        {/* Voiceover */}
        {cfg.audio?.voiceoverFile && (
          <Sequence from={cfg.audio.voiceoverStartFrame || 0}>
            <Audio src={staticFile(cfg.audio.voiceoverFile)} volume={1} />
          </Sequence>
        )}

        <Vignette />
        {cfg.product.logo && (
          <LogoWatermark
            logoSrc={cfg.product.logo}
            label={cfg.product.name}
            fadeInFrame={cfg.scenes[0].durationSeconds * fps}
          />
        )}

        <Series>
          {cfg.scenes.map((scene, i) => {
            const durationInFrames = scene.durationSeconds * fps;
            return (
              <Series.Sequence key={i} durationInFrames={durationInFrames}>
                {scene.type === 'title' && (
                  <TitleSlide content={scene.content as TitleContent} />
                )}
                {scene.type === 'problem' && (
                  <ConceptsSlide content={scene.content as ProblemContent} />
                )}
                {scene.type === 'solution' && (
                  <SolutionSlide content={scene.content as SolutionContent} />
                )}
                {scene.type === 'demo' && (
                  <DemoSlide content={scene.content as DemoContent} />
                )}
                {scene.type === 'stats' && (
                  <StatsSlide content={scene.content as StatsContent} />
                )}
                {scene.type === 'cta' && (
                  <CTASlide content={scene.content as CTAContent} logoSrc={cfg.product.logo} />
                )}
              </Series.Sequence>
            );
          })}
        </Series>
      </AbsoluteFill>
    </ThemeProvider>
  );
};
