"use client"
import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface GroupedCaption {
    start: number;
    end: number;
    text: string;
}

interface Caption {
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

export interface BGM {
    id: string;
    url: string;
    name: string;
    duration: number;
    volume: number; 
    points: BGMPoint[];
    textPoints: {
      toggle: boolean;
      ranges: Array<{ startTextPoint: number; endTextPoint: number }>;
    };
}

export interface BGMPoint {
    id: number;
    start: number;
    duration: number;
    end: number;
    startFrom: number; 
    endAt: number;
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

interface ElementsContextProps {
    backgroundsBg: BackgroundBg[];
    setBackgroundsBg: React.Dispatch<React.SetStateAction<BackgroundBg[]>>;
    backgroundColor: string;
    setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
    groupedCaptions: GroupedCaption[];
    setGroupedCaptions: React.Dispatch<React.SetStateAction<GroupedCaption[]>>;
    frames: Frame[];
    setFrames: React.Dispatch<React.SetStateAction<Frame[]>>;
    audioUrl: string | null;
    setAudioUrl: React.Dispatch<React.SetStateAction<string | null>>;
    frameTemplateMap: Record<number, string>;
    setFrameTemplateMap: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    textSegments: TextSegment[];
    setTextSegments: React.Dispatch<React.SetStateAction<TextSegment[]>>;
    secondaryTextSegmentsSec: SecondaryTextSegment[];
    setSecondaryTextSegmentsSec: React.Dispatch<React.SetStateAction<SecondaryTextSegment[]>>;
    captions: Caption[];
    setCaptions: React.Dispatch<React.SetStateAction<Caption[]>>;
    paddingBetweenLines: number;
    setPaddingBetweenLines: React.Dispatch<React.SetStateAction<number>>;
    paddingFromFrame: number;
    setPaddingFromFrame: React.Dispatch<React.SetStateAction<number>>;
    frameStyles: Record<number, FrameStyle>;
    setFrameStyles: React.Dispatch<React.SetStateAction<Record<number, FrameStyle>>>;
    transitionVideoUrl: string[];
    setTransitionVideoUrl: React.Dispatch<React.SetStateAction<string[]>>;
    transitionVolume: number[];
    setTransitionVolume: React.Dispatch<React.SetStateAction<number[]>>;
    bgmTracks: BGM[];
    setBgmTracks: React.Dispatch<React.SetStateAction<BGM[]>>;
    selectedWordsData: WordData[];
    setSelectedWordsData: React.Dispatch<React.SetStateAction<WordData[]>>;
    bgmVolume: number;
    setBgmVolume: React.Dispatch<React.SetStateAction<number>>;
}

const ElementsContext = createContext<ElementsContextProps | undefined>(undefined);

export const ElementsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [backgroundsBg, setBackgroundsBg] = useState<BackgroundBg[]>([]);
    const [backgroundColor, setBackgroundColor] = useState<string>('#000000');
    const [groupedCaptions, setGroupedCaptions] = useState<GroupedCaption[]>([]);
    const [frames, setFrames] = useState<Frame[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [frameTemplateMap, setFrameTemplateMap] = useState<Record<number, string>>({});
    const [textSegments, setTextSegments] = useState<TextSegment[]>([]);
    const [secondaryTextSegmentsSec, setSecondaryTextSegmentsSec] = useState<SecondaryTextSegment[]>([]);
    const [captions, setCaptions] = useState<Caption[]>([]);
    const [paddingBetweenLines, setPaddingBetweenLines] = useState<number>(0);
    const [paddingFromFrame, setPaddingFromFrame] = useState<number>(0);
    const [frameStyles, setFrameStyles] = useState<Record<number, FrameStyle>>({});
    const [transitionVideoUrl, setTransitionVideoUrl] = useState<string[]>([]);
    const [transitionVolume, setTransitionVolume] = useState<number[]>([]);
    const [bgmTracks, setBgmTracks] = useState<BGM[]>([]);
    const [selectedWordsData, setSelectedWordsData] = useState<WordData[]>([]);
    const [bgmVolume, setBgmVolume] = useState<number>(0.5); // Default volume 50%

    return (
        <ElementsContext.Provider
            value={{
                backgroundsBg,
                setBackgroundsBg,
                backgroundColor,
                setBackgroundColor,
                groupedCaptions,
                setGroupedCaptions,
                frames,
                setFrames,
                audioUrl,
                setAudioUrl,
                frameTemplateMap,
                setFrameTemplateMap,
                textSegments,
                setTextSegments,
                secondaryTextSegmentsSec,
                setSecondaryTextSegmentsSec,
                captions,
                setCaptions,
                paddingBetweenLines,
                setPaddingBetweenLines,
                paddingFromFrame,
                setPaddingFromFrame,
                frameStyles,
                setFrameStyles,
                transitionVideoUrl,
                setTransitionVideoUrl,
                transitionVolume,
                setTransitionVolume,
                bgmTracks,
                setBgmTracks,
                selectedWordsData,
                setSelectedWordsData,
                bgmVolume,
                setBgmVolume
            }}
        >
            {children}
        </ElementsContext.Provider>
    );
};

export const useElements = (): ElementsContextProps => {
    const context = useContext(ElementsContext);
    if (!context) {
        throw new Error('useElements must be used within an ElementsProvider');
    }
    return context;
};