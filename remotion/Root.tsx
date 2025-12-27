"use client";
import React from 'react';
import { Composition } from 'remotion';
import RemotionVideo1 from './remotionComponents/RemotionVideo1';
import { ElementsProvider, useElements } from '../hooks/elementsProvider';
import { DurationProvider, useDuration } from '../hooks/durationProvider';
import TrialVideo1 from './remotionComponents/TrialVideo1';

// Define interfaces for the types used in Props
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
  start: number;
  duration: number;
  end: number;
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

const RemotionRootWrapper: React.FC = () => {
  return (
    <ElementsProvider>
      <DurationProvider>
        <InnerComposition />
      </DurationProvider>
    </ElementsProvider>
  );
};

const InnerComposition: React.FC = () => {
  const elements = useElements();
  const { durations, setDurations } = useDuration();

  const defaultProps: Props = {
    groupedCaptions: elements.groupedCaptions,
    frames: elements.frames,
    audioUrl: elements.audioUrl,
    setDurations,
    frameTemplateMap: elements.frameTemplateMap,
    textSegments: elements.textSegments,
    captions: elements.captions,
    paddingBetweenLines: elements.paddingBetweenLines,
    paddingFromFrame: elements.paddingFromFrame,
    frameStyles: elements.frameStyles,
    transitionVideoUrl: elements.transitionVideoUrl,
    transitionVolume: elements.transitionVolume,
    bgmTracks: elements.bgmTracks,
    secondaryTextSegmentsSec: elements.secondaryTextSegmentsSec,
    backgroundsBg: elements.backgroundsBg,
    backgroundColor: elements.backgroundColor,
    selectedWordsData: elements.selectedWordsData,
  };

  return (
    <Composition
      id="RemotionVideo1"
      component={RemotionVideo1}
      durationInFrames={durations || 100}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
};

export default RemotionRootWrapper;
