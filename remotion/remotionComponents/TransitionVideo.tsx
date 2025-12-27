"use client";
import React, { useRef, useEffect } from 'react';
import { AbsoluteFill, Video, useVideoConfig, interpolate, useCurrentFrame, Easing } from 'remotion';

interface TransitionVideoProps {
  src: string;
  volume: number;
  durationInFrames: number;
}

export const TransitionVideo: React.FC<TransitionVideoProps> = ({ src, volume, durationInFrames }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const fadeDuration = 30;
    let opacity = 1;

    if (frame < fadeDuration) {
      // Fade-in
      opacity = interpolate(
        frame,
        [0, fadeDuration],
        [0, 1],
        {
          easing: Easing.inOut(Easing.quad),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }
      );
    } else if (frame > durationInFrames - fadeDuration) {
      // Fade-out
      opacity = interpolate(
        frame,
        [durationInFrames - fadeDuration, durationInFrames],
        [1, 0],
        {
          easing: Easing.inOut(Easing.quad),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }
      );
    }

    // Clear the canvas
    context.clearRect(0, 0, width, height);

    // Set global opacity
    context.globalAlpha = opacity;

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, width, height);
  }, [frame, width, height, durationInFrames]);

  return (
    <AbsoluteFill style={{ zIndex: 10 }}>
      <Video
        ref={videoRef}
        src={src}
        volume={volume}
        startFrom={0}
        style={{ 
          opacity: 0.9, 
          width: 1, 
          height: 1, 
          position: 'absolute' 
        }}
      />
      <AbsoluteFill>
        <canvas ref={canvasRef} width={width} height={height} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
