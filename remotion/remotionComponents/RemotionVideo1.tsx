"use client"
import CaptionText from '../../components/CaptionText';
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Sequence, Audio, useVideoConfig, Img, Video, staticFile, useCurrentFrame, spring, interpolate } from 'remotion';
import { TransitionVideo } from './TransitionVideo';
import '../../app/fonts.css'
import { getVideoMetadata } from '@remotion/media-utils';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { useElements } from '../../hooks/elementsProvider';
import { useDuration } from '../../hooks/durationProvider';
import { BGM, BGMPoint } from '@/hooks/elementsProvider';

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
  start: number;
  end: number;
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

const splitStyles = (style: FrameStyle) => {
  const absoluteFillStyles: React.CSSProperties = {
    width: style.width,
    height: style.height,
    justifyContent: style.justifyContent,
    alignItems: style.alignItems,
    padding: style.padding,
  };

  const mediaStyles: React.CSSProperties = {
    objectFit: style.objectFit as React.CSSProperties['objectFit'] || 'cover',
    objectPosition: style.objectPosition as React.CSSProperties['objectPosition'] || 'center',
    borderStyle: style.borderStyle,
    borderWidth: style.borderWidth,
    borderColor: style.borderColor,
    borderRadius: style.borderRadius,
    boxShadow: style.boxShadow,
  };

  return { absoluteFillStyles, mediaStyles };
};

const RemotionVideo1: React.FC<Props> = (props) => {
  const {
    groupedCaptions,
    frames,
    audioUrl,
    setDurations,
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
  } = props;
  const { fps } = useVideoConfig();
  const [transitionDurationsInFrames, setTransitionDurationsInFrames] = React.useState<number[]>([]);
  const [audioDurationInFrames, setAudioDurationInFrames] = useState<number>(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (hasError) {
      const timer = setTimeout(() => setHasError(false), 0);
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  try {
    if (hasError) {
      return null;
    }
  } catch (error) {
    console.error("Error occurred, refreshing component:", error);
    setHasError(true); 
    return null; 
  }
  
  React.useEffect(() => {
    const loadTransitionDurations = async () => {
      if (!transitionVideoUrl || transitionVideoUrl.length === 0) {
        setTransitionDurationsInFrames([]); 
        return;
      }
      const durations = await Promise.all(
        transitionVideoUrl.map(async (url) => {
          const metadata = await getVideoMetadata(url);
          const durationInSeconds = metadata.durationInSeconds;
          const durationInFrames = Math.ceil(durationInSeconds * fps);
          return durationInFrames;
        })
      );
      setTransitionDurationsInFrames(durations);
    };
  
    loadTransitionDurations();
  }, [fps, transitionVideoUrl]);

  React.useEffect(() => {
    const loadAudioDuration = async () => {
      if (audioUrl) {
        const audioDurationInSeconds = await getAudioDurationInSeconds(audioUrl);
        const durationInFrames = Math.ceil(audioDurationInSeconds * fps);
        setAudioDurationInFrames(durationInFrames);
        if (setDurations) {
          setDurations(durationInFrames);
        }
      }
    };
  
    loadAudioDuration();
  }, [audioUrl, fps, setDurations]);  

const renderBGMTracks = () => {
  if (!bgmTracks || bgmTracks.length === 0 || !audioDurationInFrames) return null;
  return bgmTracks.flatMap((track) => {
    const sequences = [];

    // Render each bgmPoint as a separate sequence
    sequences.push(
      ...track.points.map((point) => (
        <Sequence
          key={`bgm-${track.id}-${point.id}`}
          from={Math.floor(point.start * fps)}
          durationInFrames={Math.ceil(point.duration * fps)}
        >
          <Audio
            src={track.url}
            startFrom={Math.ceil(point.startFrom * fps)}
            volume={(frame) => {
              const currentAbsoluteFrame = frame + Math.floor(point.start * fps);
              const fadeOutStartFrame = audioDurationInFrames - 3 * fps; // Start fading out 3 seconds before the end
              return interpolate(
                currentAbsoluteFrame,
                [fadeOutStartFrame, audioDurationInFrames],
                [track.volume, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );
            }}
            endAt={Math.ceil(point.endAt * fps)}
          />
        </Sequence>
      ))
    );

    // Handle textPoints if toggle is on
    if (track.textPoints.toggle) {
      const autoPlaySequences = track.textPoints.ranges.flatMap((range, rangeIndex) => {
        const wordsInRange = captions.filter(
          (word) => word.start >= range.startTextPoint && word.end <= range.endTextPoint
        );

        return wordsInRange.map((word, wordIndex) => (
          <Sequence
            key={`bgm-auto-${track.id}-${rangeIndex}-word-${wordIndex}`}
            from={Math.floor(word.start * fps)}
            durationInFrames={Math.ceil((word.end - word.start) * fps)}
          >
            <Audio
              src={track.url}
              startFrom={0}
              volume={(frame) => {
                const currentAbsoluteFrame = frame + Math.floor(word.start * fps);
                const fadeOutStartFrame = audioDurationInFrames - 3 * fps;
                return interpolate(
                  currentAbsoluteFrame,
                  [fadeOutStartFrame, audioDurationInFrames],
                  [track.volume, 0],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );
              }}
              endAt={Math.ceil(track.duration * fps)}
            />
          </Sequence>
        ));
      });

      sequences.push(...autoPlaySequences);
    }

    return sequences;
  });
}; 

  const renderFramesBasedOnTemplate = () => {
    if (!frames || frames.length === 0) return null;
    const sequences: React.ReactNode[] = [];
    const currentFrame = useCurrentFrame();
  
    frames.forEach((frame, index) => {
      const template = frameTemplateMap[frame.start] || 'Fullscreen';
      const style = frameStyles[frame.start] || {};
    
      // Adjusting transition sequence to play fully
      if (index < frames.length - 1 && transitionDurationsInFrames.length > 0) {
        const nextFrame = frames[index + 1];
        const transitionIndex = index % transitionVideoUrl.length;
        const transitionDuration = transitionDurationsInFrames[transitionIndex];
        const transitionStartTime = Math.floor(nextFrame.start * fps) - transitionDuration;
    
        sequences.push(
          <Sequence
            key={`transition-${index}-${nextFrame.start}`}
            from={transitionStartTime}
            durationInFrames={transitionDuration}
          >
            <TransitionVideo 
              src={transitionVideoUrl[transitionIndex]} 
              volume={transitionVolume[transitionIndex] || 100} 
              durationInFrames={transitionDuration}
            />
          </Sequence>
        );
      }
    
      // Render the main frame with animation parameters
      const frameSequence = (() => {
        switch (template) {
          case 'Fullscreen':
            return renderFullscreenFrame(frame, index, style, fps, currentFrame);
          case 'Boxed':
            return renderBoxedFrame(frame, index, style, fps, currentFrame);
          case 'Boxed2':
          case 'Boxed3':
            return renderBoxed23Frames(frame, index, template, style, fps, currentFrame);
          default:
            if (template.startsWith('Boxed') && parseInt(template.slice(5)) >= 4) {
              return renderBoxedNFrames(frame, index, parseInt(template.slice(5)), style, fps, currentFrame);
            }
            return renderFullscreenFrame(frame, index, style, fps, currentFrame);
        }
      })();
    
      sequences.push(frameSequence);
    });        
  
    return sequences;
  };

  const useFloatingAnimation = (fps: number, frame: number) => {
    const xAmplitude = 5; // Keep increased amplitude for noticeable movement
    const yAmplitude = 5;
    const scaleAmplitude = 0.02; // Reduced scale variation for subtle effect
  
    const xFrequency = 0.4; // Frequency for horizontal movement
    const yFrequency = 0.4; // Frequency for vertical movement
    const scaleFrequency = 0.2; // Frequency for scale variation
  
    const xOffset = xAmplitude * Math.sin((2 * Math.PI * xFrequency * frame) / fps);
    const yOffset = yAmplitude * Math.cos((2 * Math.PI * yFrequency * frame) / fps);
    const scale = 1 + scaleAmplitude * Math.sin((2 * Math.PI * scaleFrequency * frame) / fps);
  
    return { transform: `translate(${xOffset}px, ${yOffset}px) scale(${scale})` };
  };  
  
  const renderFullscreenFrame = (frame: Frame, index: number, style: FrameStyle, fps: number, currentFrame: number) => {
    const { absoluteFillStyles, mediaStyles } = splitStyles(style);
    const animation = useFloatingAnimation(fps, currentFrame);
  
    return (
      <Sequence
        key={index}
        from={Math.floor(frame.start * fps)}
        durationInFrames={Math.ceil(frame.duration * fps)}
      >
        <AbsoluteFill style={{ padding: '0rem', ...absoluteFillStyles }}>
          <div style={{ width: '100%', height: '100%', transition: 'transform 0.3s ease-in-out', ...animation }}>
            {frame.videoUrl ? (
              <Video
                style={{ width: '100%', height: '100%', ...mediaStyles }}
                className="object-cover"
                src={frame.videoUrl || ""}
              />
            ) : frame.imageUrl ? (
              <Img
                style={{ width: '100%', height: '100%', ...mediaStyles }}
                className="object-cover"
                src={frame.imageUrl || ""}
              />
            ) : null}
          </div>
        </AbsoluteFill>
      </Sequence>
    );
  };
  
  const renderBoxedFrame = (frame: Frame, index: number, style: FrameStyle, fps: number, currentFrame: number) => {
    const { absoluteFillStyles, mediaStyles } = splitStyles(style);
    const animation = useFloatingAnimation(fps, currentFrame);
  
    return (
      <Sequence
        key={index}
        from={Math.floor(frame.start * fps)}
        durationInFrames={Math.ceil(frame.duration * fps)}
      >
        <AbsoluteFill
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            ...absoluteFillStyles,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '40%',
              boxShadow: style.boxShadow,
              borderRadius: style.borderRadius,
              overflow: 'hidden',
              ...animation,
            }}
          >
            {frame.imageUrl ? (
              <Img
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  ...mediaStyles,
                }}
                src={frame.imageUrl || ""}
              />
            ) : frame.videoUrl ? (
              <Video
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  ...mediaStyles,
                }}
                src={frame.videoUrl || ""}
              />
            ) : null}
          </div>
        </AbsoluteFill>
      </Sequence>
    );
  };
  
  const renderBoxed23Frames = (frame: Frame, index: number, template: string, style: FrameStyle, fps: number, currentFrame: number) => {
    const { absoluteFillStyles, mediaStyles } = splitStyles(style);
    const animation = useFloatingAnimation(fps, currentFrame);
  
    const groupedFrames = frames.reduce((acc: { [key: number]: Frame[] }, frame: Frame) => {
      if (!acc[frame.start]) {
        acc[frame.start] = [];
      }
      acc[frame.start].push(frame);
      return acc;
    }, {});
  
    const startTime = frame.start;
    const frameGroup = groupedFrames[startTime];
    const numFrames = template === 'Boxed2' ? 2 : 3;
  
    return (
      <Sequence
        key={index}
        from={Math.floor(startTime * fps)}
        durationInFrames={Math.ceil(frameGroup[0].duration * fps)}
      >
        <AbsoluteFill style={{ ...absoluteFillStyles }}>
          {frameGroup.slice(0, numFrames).map((groupFrame, groupIndex) => (
            <AbsoluteFill
              key={groupIndex}
              style={{
                top: `${(100 / numFrames) * groupIndex}%`,
                height: `${100 / numFrames}%`,
                padding: style?.padding,
              }}
            >
              <div style={{ width: '100%', height: '100%', ...animation, boxShadow: style.boxShadow, borderRadius: style.borderRadius, }}>
                {groupFrame.imageUrl ? (
                  <Img
                    style={{
                      width: '100%',
                      height: '100%',
                      ...mediaStyles,
                    }}
                    src={groupFrame.imageUrl || ""}
                  />
                ) : groupFrame.videoUrl ? (
                  <Video
                    style={{
                      width: '100%',
                      height: '100%',
                      ...mediaStyles,
                    }}
                    src={groupFrame.videoUrl || ""}
                  />
                ) : null}
              </div>
            </AbsoluteFill>
          ))}
        </AbsoluteFill>
      </Sequence>
    );
  };
  
  const renderBoxedNFrames = (frame: Frame, index: number, n: number, style: FrameStyle, fps: number, currentFrame: number) => {
    const { absoluteFillStyles, mediaStyles } = splitStyles(style);
    const animation = useFloatingAnimation(fps, currentFrame);
  
    const padding = style?.padding || '0px';
    const justifyContent = style?.justifyContent || 'center';
    const alignItems = style?.alignItems || 'center';
  
    const groupedFrames = frames.reduce((acc: { [key: number]: Frame[] }, frame: Frame) => {
      if (!acc[frame.start]) {
        acc[frame.start] = [];
      }
      acc[frame.start].push(frame);
      return acc;
    }, {});
  
    const startTime = frame.start;
    const frameGroup = groupedFrames[startTime];
    const rows = Math.ceil(n / 2);
  
    return (
      <Sequence
        key={index}
        from={Math.floor(startTime * fps)}
        durationInFrames={Math.ceil(frameGroup[0].duration * fps)}
      >
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent,
            alignItems,
            height: '100%',
            width: '100%',
            margin: 0,
            padding: 0,
            ...absoluteFillStyles,
          }}
        >
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const rowFrames = frameGroup.slice(rowIndex * 2, rowIndex * 2 + 2);
  
            return (
              <div
                key={rowIndex}
                style={{
                  display: 'flex',
                  justifyContent: rowFrames.length === 1 ? 'flex-start' : justifyContent,
                  alignItems,
                  width: '100%',
                  margin: 0,
                  padding: 0,
                  gap: 0,
                  boxShadow: style.boxShadow,
                  borderRadius: style.borderRadius,
                }}
              >
                {rowFrames.map((groupFrame, colIndex) => (
                  <div
                    key={colIndex}
                    style={{
                      flex: 1,
                      maxWidth: rowFrames.length === 1 ? '50%' : '50%',
                      aspectRatio: 1,
                      padding,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      ...animation,
                    }}
                  >
                    {groupFrame.imageUrl ? (
                      <Img
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          ...mediaStyles,
                        }}
                        src={groupFrame.imageUrl || ""}
                      />
                    ) : groupFrame.videoUrl ? (
                      <Video
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          ...mediaStyles,
                        }}
                        src={groupFrame.videoUrl || ""}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            );
          })}
        </AbsoluteFill>
      </Sequence>
    );
  };   

  const renderNStackCaptions = (
    captionsInSegment: GroupedCaption[],
    segmentStart: number,
    segmentStyle: TextSegment['style'],
    n: number, 
    captions: Caption[],
    selectedWordsData: WordData[] 
  ) => {
    const groupedCaptions: GroupedCaption[][] = [];
    
    for (let i = 0; i < captionsInSegment.length; i += n) {
      groupedCaptions.push(captionsInSegment.slice(i, i + n));
    }
  
    return groupedCaptions.map((group, groupIndex) => {
      const groupStart = group[0].start;
      const groupEnd = group[group.length - 1].end;
  
      const captionsInGroup = captions
        .filter((wc) => wc.start >= groupStart && wc.end <= groupEnd)
        .sort((a, b) => a.start - b.start);
  
      const wordsWithTimingAndLine = captionsInGroup.map((wc) => {
        const lineIndex = group.findIndex(
          (caption) => wc.start >= caption.start && wc.end <= caption.end
        );
  
        // Check for custom color
        const customColor = selectedWordsData.find(
          (wordData) => 
            wordData.word === wc.word && 
            wc.start >= wordData.captionStart && 
            wc.end <= wordData.captionEnd
        )?.color;
  
        return { ...wc, lineIndex, color: customColor || segmentStyle.color };
      });
  
      return (
        <Sequence
          key={`group-${groupIndex}`}
          from={Math.floor((groupStart - segmentStart) * fps)}
          durationInFrames={Math.ceil((groupEnd - groupStart) * fps)}
        >
          {wordsWithTimingAndLine.map((wordObj, wordIndex, wordsArray) => {
            let wordStart = wordObj.start;
            let wordEnd = wordObj.end;
            const lineIndex = wordObj.lineIndex;
  
            if (wordEnd === wordStart) {
              if (wordIndex < wordsArray.length - 1) {
                const nextWord = wordsArray[wordIndex + 1];
                const timeDifference = nextWord.start - wordStart;
                wordEnd = wordStart + timeDifference / 4;
              } else {
                wordEnd = wordStart + 0.1; 
              }
            }
  
            if (wordIndex < wordsArray.length - 1 && wordEnd < wordsArray[wordIndex + 1].start) {
              const nextWord = wordsArray[wordIndex + 1];
              const timeDifference = nextWord.start - wordStart;
              wordEnd = nextWord.start; 
            }
  
            if (wordEnd > wordStart) {
              // Build textLines with word objects
              const textLines: WordWithStyle[][] = group.map((caption, idx) => {
                if (idx < lineIndex) {
                  // Previous lines: include all words
                  const wordsInLine = wordsWithTimingAndLine
                    .filter(w => w.lineIndex === idx)
                    .map(w => ({ word: w.word, color: w.color, start: w.start, end: w.end }));
                  return wordsInLine;
                } else if (idx === lineIndex) {
                  // Current line: include words up to current word
                  const wordsInLine = wordsWithTimingAndLine
                    .filter(w => w.lineIndex === idx && w.start <= wordObj.start)
                    .map(w => ({ word: w.word, color: w.color, start: w.start, end: w.end }));
                  return wordsInLine;
                } else {
                  return [];
                }
              });
  
              return (
                <Sequence
                  key={`word-${wordIndex}`}
                  from={Math.floor((wordStart - groupStart) * fps)}
                  durationInFrames={Math.ceil((wordEnd - wordStart) * fps)}
                >
                  <CaptionText
                    textLines={textLines}
                    styleName={`${n}stack${segmentStyle}`}
                    style={{
                      ...segmentStyle,
                      color: segmentStyle.color,
                    }}
                    paddingBetweenLines={paddingBetweenLines}
                    paddingFromFrame={paddingFromFrame}
                    rowIndex={lineIndex}  
                    totalRows={n}
                  />
                </Sequence>
              );
            }
  
            return null;
          })}
        </Sequence>
      );
    });
  };
  
  const renderSecondaryTextSegments = () => {
    if (!secondaryTextSegmentsSec || secondaryTextSegmentsSec.length === 0) return null; 
    return secondaryTextSegmentsSec.map((segment) => {
      return (
        <Sequence
          key={segment.id}
          from={Math.floor(segment.start * fps)}
          durationInFrames={Math.ceil((segment.end - segment.start) * fps)}
        >
          <AbsoluteFill
            style={{
              position: 'absolute',
              left: segment.style.left,
              top: segment.style.top,
              fontFamily: segment.style.fontFamily,
              color: segment.style.color,
              fontSize: segment.style.fontSize,
              fontWeight: segment.style.fontWeight,
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
            <div style={{ zIndex: segment.style.stack }}>{segment.text}</div>
          </AbsoluteFill>
        </Sequence>
      );
    });
  };

  const renderBackground = () => {
    return (backgroundsBg || []).map((background, index) => (
      <Sequence
        key={`background-${index}`}
        from={Math.floor(background.start * fps)}
        durationInFrames={Math.ceil(background.duration * fps)}
      >
        <AbsoluteFill style={{ width: '100%', height: '100%' }}>
          {background.videoUrl ? (
            <Video
              src={background.videoUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loop
              muted
            />
          ) : background.imageUrl ? (
            <Img
              src={background.imageUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ backgroundColor: 'black', width: '100%', height: '100%' }} />
          )}
        </AbsoluteFill>
      </Sequence>
    ));
  };
  
  return (
    <AbsoluteFill style={{ backgroundColor: backgroundColor, width: '100%', height: '100%' }}>
      {renderBackground()}
      {renderFramesBasedOnTemplate()}
  
      {textSegments && textSegments.length > 0 && textSegments.map((segment) => {
        const captionsInSegment = groupedCaptions.filter(
          (caption) => caption.end > segment.start && caption.start < segment.end
        );
  
        const adjustedCaptionsInSegment = captionsInSegment.map((caption, index, array) => {
          const nextCaption = array[index + 1];
          let adjustedEnd = caption.end;
  
          if (nextCaption) {
            if (caption.end < nextCaption.start) {
              adjustedEnd = nextCaption.start;
            }
          }
  
          return { ...caption, end: adjustedEnd };
        });
  
        return (
          <Sequence
            key={segment.id}
            from={Math.floor(segment.start * fps)}
            durationInFrames={Math.ceil((segment.end - segment.start) * fps)}
          >
            {renderNStackCaptions(adjustedCaptionsInSegment, segment.start, segment.style, segment.style.stack, captions, selectedWordsData)}
          </Sequence>
        );
      })}
  
      {renderSecondaryTextSegments()} 
  
      {audioUrl && <Audio src={staticFile('/sounds/speech.mp3')} />}
      {renderBGMTracks()}
    </AbsoluteFill>
  );
  
};

export default RemotionVideo1;