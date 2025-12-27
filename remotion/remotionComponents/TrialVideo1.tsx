"use client"
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Sequence, Video, Img, Audio } from 'remotion';

export interface GroupedCaption {
    start: number;
    end: number;
    text: string;
  }
  
  export interface Caption {
    start: number;
    end: number;
    word: string;
  }
  
  export interface Frame {
    start: number;
    end: number;
    imageUrl?: string;
    videoUrl?: string;
    duration: number;
  }
  
  interface TextSegment {
    id: string;
    start: number;
    duration: number;
    end: number;
    style: {
      fontFamily: string;
      color: string;
      fontSize: string;
      fontWeight: number;
      opacity: number;
      transform: string;
      left: string;
      top: string;
      lineHeight: string;
      width: string;
      height: string;
      stack: number;
      place: string;
    };
  }
  
  interface FrameStyle {
    width?: string;
    height?: string;
    objectPosition?: string;
    objectFit?: string;
    justifyContent?: string;
    alignItems?: string;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
    borderStyle?: string;
    borderWidth?: string;
    borderColor?: string;
    overflow?: string;
  }
  
  interface BGM {
    id: string;
    url: string;
    name: string;
    duration: number;
    points: BGMPoint[];
    textPoints: {
      toggle: boolean;
      ranges: Array<{ startTextPoint: number; endTextPoint: number }>; 
    };
  }
  
  interface BGMPoint {
    id: number;
    start: number; // Start time within the BGM
    duration: number; // Duration for this point
    end: number; // Calculated as start + duration
  }
  
  interface SecondaryTextSegment {
    id: string;
    text: string;
    start: number;
    duration: number;
    end: number;
    style: {
      fontFamily: string;
      color: string;
      fontSize: string;
      fontWeight: number;
      opacity: number;
      transform: string;
      left: string;
      top: string;
      lineHeight: string;
      width: string;
      height: string;
      stack: number;
      place: string;
    };
  }
  
  interface BackgroundBg {
    id: number;
    start: number;
    end: number;
    imageUrl?: string;
    videoUrl?: string;
    duration: number;
  }
  
  interface WordData {
    word: string;
    color: string;
    captionStart: number;
    captionEnd: number;
  }
  
  interface WordWithStyle {
    word: string;
    color?: string;
  }
  
  type Props = {
    groupedCaptions: GroupedCaption[];
    frames: Frame[];
    audioUrl: string | null;
    setDurations?: (frameValue: number) => void;
    frameTemplateMap: { [key: number]: string };
    textSegments: TextSegment[];
    captions: Caption[];
    paddingBetweenLines: number;
    paddingFromFrame: number;
    frameStyles: { [key: number]: FrameStyle };
    transitionVideoUrl: string[]; 
    transitionVolume: number[];
    bgmTracks: BGM[];
    secondaryTextSegmentsSec: SecondaryTextSegment[];
    backgroundsBg: BackgroundBg[];
    backgroundColor: string;
    selectedWordsData: WordData[];
  };

  const TrialVideo1: React.FC<Props> = ({
      groupedCaptions,
      frames,
      audioUrl,
      frameTemplateMap,
      textSegments,
      captions,
      paddingBetweenLines,
      paddingFromFrame,
      frameStyles,
      transitionVideoUrl,
      transitionVolume,
      bgmTracks,
      secondaryTextSegmentsSec,
      backgroundsBg,
      backgroundColor,
      selectedWordsData,
  }) => {
      const renderFrames = () => {
          return frames.map((frame, index) => {
              const frameStyle = frameStyles[frame.start] || {};
  
              return (
                  <Sequence key={`frame-${index}`} from={frame.start} durationInFrames={frame.duration}>
                        <AbsoluteFill style={{ ...frameStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' } as React.CSSProperties}>
                          {frame.videoUrl ? (
                              <Video src={frame.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : frame.imageUrl ? (
                              <Img src={frame.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                              <div style={{ backgroundColor: backgroundColor, width: '100%', height: '100%' }} />
                          )}
                      </AbsoluteFill>
                  </Sequence>
              );
          });
      };
  
      const renderCaptions = () => {
          return captions.map((caption, index) => (
              <Sequence key={`caption-${index}`} from={caption.start} durationInFrames={caption.end - caption.start}>
                  <AbsoluteFill
                      style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: `${paddingFromFrame}px`,
                      }}
                  >
                      <p style={{ color: 'white', fontSize: '24px', textAlign: 'center' }}>{caption.word}</p>
                  </AbsoluteFill>
              </Sequence>
          ));
      };
  
      const renderTextSegments = () => {
          return textSegments.map((segment, index) => (
              <Sequence key={`text-segment-${index}`} from={segment.start} durationInFrames={segment.duration}>
                  <AbsoluteFill
                      style={{
                          position: 'absolute',
                          left: segment.style.left,
                          top: segment.style.top,
                          color: segment.style.color,
                          fontSize: segment.style.fontSize,
                          fontWeight: segment.style.fontWeight,
                          fontFamily: segment.style.fontFamily,
                          opacity: segment.style.opacity,
                          transform: segment.style.transform,
                          lineHeight: segment.style.lineHeight,
                          width: segment.style.width,
                          height: segment.style.height,
                          display: 'flex',
                          justifyContent: segment.style.place === 'center' ? 'center' : 'flex-start',
                          alignItems: 'center',
                      }}
                  >
                      <div style={{ zIndex: segment.style.stack }}>{segment.duration}</div>
                  </AbsoluteFill>
              </Sequence>
          ));
      };
  
      const renderBackgrounds = () => {
          return backgroundsBg.map((background, index) => (
              <Sequence key={`background-${index}`} from={background.start} durationInFrames={background.duration}>
                  <AbsoluteFill style={{ width: '100%', height: '100%' }}>
                      {background.videoUrl ? (
                          <Video src={background.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loop muted />
                      ) : background.imageUrl ? (
                          <Img src={background.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                          <div style={{ backgroundColor: backgroundColor, width: '100%', height: '100%' }} />
                      )}
                  </AbsoluteFill>
              </Sequence>
          ));
      };
  
      const renderAudio = () => {
          if (!audioUrl) return null;
          return <Audio src={audioUrl} />;
      };
  
      const renderBGMTracks = () => {
          return bgmTracks.map((track, index) => (
              <Sequence key={`bgm-${index}`} from={track.points[0]?.start || 0} durationInFrames={track.duration}>
                  <Audio src={track.url} />
              </Sequence>
          ));
      };
  
      return (
          <AbsoluteFill style={{ backgroundColor: backgroundColor || 'black' }}>
              {renderBackgrounds()}
              {renderFrames()}
              {renderCaptions()}
              {renderTextSegments()}
              {renderAudio()}
              {renderBGMTracks()}
              <div style={{color:'white' }}>Hello</div>
          </AbsoluteFill>
      );
  };
  
  export default TrialVideo1;
  