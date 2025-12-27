"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Player } from '@remotion/player';
import RemotionVideo1 from './RemotionVideo1';
import { Button } from '../../components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/ui/accordion';
import { CircleUser, Clapperboard, Cpu, Download, Loader, Save } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { DeviceFrameset } from "react-device-frameset";
import { Heart, MessageCircle, Send, Home, Search, PlusSquare } from 'lucide-react'
import 'react-device-frameset/styles/marvel-devices.min.css'
import { saveAs } from 'file-saver';
import { useDuration } from '../../hooks/durationProvider';
import { useElements } from '../../hooks/elementsProvider';
import { PlayerRef } from '@remotion/player';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

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

export interface TextSegment {
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

export interface SecondaryTextSegment {
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

export interface FrameStyle {
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
  points: BGMPoint[];
  textPoints: {
    toggle: boolean;
    ranges: Array<{ startTextPoint: number; endTextPoint: number }>; // Array for multiple ranges
  };
}

export interface BGMPoint {
  id: number;
  start: number;
  duration: number;
  end: number;
}

export interface BackgroundBg {
  id: number;
  start: number;
  end: number;
  imageUrl?: string;
  videoUrl?: string;
  duration: number;
}

export interface WordData {
  word: string;
  color: string;
  captionStart: number;
  captionEnd: number;
}

type Props = {
  groupedCaptions: GroupedCaption[];
  frames: Frame[];
  audioUrl: string | null;
  frameTemplateMap: { [key: number]: string };
  textSegments: TextSegment[];
  perWordCaptions: Caption[];
  paddingBetweenLines: number;
  paddingFromFrame: number;
  frameStyles: { [key: number]: FrameStyle };
  transitionVideoUrl: string[]; 
  transitionVolume: number[];
  bgmTracks: BGM[];
  textSegmentsSec: SecondaryTextSegment[];
  backgroundsBg: BackgroundBg[];
  backgroundColor: string;
  selectedWordsData: WordData[];
};

export default function RemotionComponent1() {
  const { durations, setDurations } = useDuration();
  const {
    backgroundsBg,
    backgroundColor,
    groupedCaptions,
    frames,
    audioUrl,
    frameTemplateMap,
    textSegments,
    secondaryTextSegmentsSec,
    captions,
    paddingBetweenLines,
    paddingFromFrame,
    frameStyles,
    transitionVideoUrl,
    transitionVolume,
    bgmTracks,
    selectedWordsData,
  } = useElements();
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showReenterFullscreen, setShowReenterFullscreen] = useState<boolean>(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerComponentRef = useRef<PlayerRef>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [newWindow, setNewWindow] = useState<Window | null>(null);

  useEffect(() => {
    if (audioUrl && audioUrl.trim() !== '') {
      const audio = document.createElement('audio');
      audio.src = audioUrl;
      audio.addEventListener('loadedmetadata', () => {
        const audioDuration = audio.duration;
        setDurations(Math.ceil(audioDuration * 30));
        setIsPlayerReady(true);
      });
    }
  }, [audioUrl, setDurations]);

  const setupAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const audioElements = playerRef.current?.getElementsByTagName('audio');
    if (audioElements && audioElements.length > 0) {
      const audioElement = audioElements[0];
      const source = audioContextRef.current.createMediaElementSource(audioElement);
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 0;
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      const dest = audioContextRef.current.createMediaStreamDestination();
      source.connect(dest);
      return dest.stream;
    }
    return null;
  };

  const startExport = async () => {
    setIsExporting(true);

    // Start screen sharing and store the stream
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: 'monitor' },
      audio: false,
    });

    setScreenStream(screenStream); // Store the screen stream for later use
    setShowReenterFullscreen(true); // Show re-enter fullscreen button
  };

  const handleReenterFullscreenAndStartRecording = async () => {
    if (!screenStream) return;

    setShowReenterFullscreen(false);
    recordedChunksRef.current = [];
    setRecordingStartTime(Date.now()); // Set the start time for trimming

    const playerAudioStream = await setupAudioContext();

    // Enter fullscreen mode
    if (playerRef.current) {
      await playerRef.current.requestFullscreen();
    }

    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
    });

    const combinedStream = new MediaStream();
    screenStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
    if (playerAudioStream) {
      playerAudioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
    }
    audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

    mediaRecorderRef.current = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm; codecs=vp9',
      videoBitsPerSecond: 8000000,
    });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      if (recordedChunksRef.current.length > 0) {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video-export-trimmed.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      screenStream.getTracks().forEach(track => track.stop());
      audioStream.getTracks().forEach(track => track.stop());

      if (document.fullscreenElement) {
        document.exitFullscreen();
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setIsExporting(false);
    };

    mediaRecorderRef.current.start();
    playerComponentRef.current?.seekTo(0);
    await playerComponentRef.current?.play();

    const recordingDurationMs = (durations / 30) * 1000;
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        playerComponentRef.current?.pause();
      }
    }, recordingDurationMs + 500);
  };

  const openInNewWindow = () => {
    if (newWindow && !newWindow.closed) {
      newWindow.document.title = 'Video Preview';
      newWindow.document.head.querySelectorAll('link[rel="stylesheet"]').forEach((link) => link.remove());
      document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        const newLink = link.cloneNode(true) as HTMLLinkElement;
        newWindow.document.head.appendChild(newLink);
      });
    } else {
      const win = window.open('', '_blank', 'width=323,height=700');
      if (win) {
        setNewWindow(win);
        win.document.title = 'Video Preview';
        
        document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
          const newLink = link.cloneNode(true) as HTMLLinkElement;
          win.document.head.appendChild(newLink);
        });
        
        const styleLink = win.document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = 'https://cdn.jsdelivr.net/npm/react-device-frameset@1.3.2/dist/styles/marvel-devices.min.css';
        win.document.head.appendChild(styleLink);
      }
    }
  };

  const NewWindowContent = () => (
    <div className="mt-4 flex flex-col gap-4 justify-center items-center">
      <DeviceFrameset device="iPhone 5s" color="silver" width={264} height={470}>
        <div className="relative w-full h-full flex items-start justify-start">
          <Player
            style={{
              width: '100%',
              height: '100%',
            }}
            component={RemotionVideo1}
            durationInFrames={durations || 100}
            compositionWidth={1080}
            compositionHeight={1920}
            fps={30}
            controls
            className="border rounded-none shadow-lg"
            inputProps={{
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
              selectedWordsData
            }}
          />
        </div>
      </DeviceFrameset>
    </div>
  );

  return (
    <div className="w-full p-0 space-y-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="preview">
          <AccordionTrigger onClick={() => isPlayerReady}>
            <div className="flex items-center">
              <Label className="font-bold">Your Reel/Shorts Preview</Label>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col mt-1">
              {isPlayerReady ? (
                <div className="mt-4 flex justify-center items-center">
                  <DeviceFrameset device="iPhone 5s" color='silver' width={264} height={470}>
                    <div ref={playerRef} className="relative w-full h-full flex items-start justify-start">
                      <Player
                        style={{ width: '100%', height: '100%' }}
                        component={RemotionVideo1}
                        ref={playerComponentRef}
                        durationInFrames={durations || 100}
                        compositionWidth={1080}
                        compositionHeight={1920}
                        fps={30}
                        controls={!isExporting}
                        className="border rounded-none shadow-lg"
                        inputProps={{
                          groupedCaptions, frames, audioUrl, setDurations, frameTemplateMap,
                          textSegments, captions, paddingBetweenLines, paddingFromFrame,
                          frameStyles, transitionVideoUrl, transitionVolume, bgmTracks,
                          secondaryTextSegmentsSec, backgroundsBg, backgroundColor,
                          selectedWordsData
                        }}
                      />
                    </div>
                  </DeviceFrameset>
                </div>
              ) : (
                <div className="text-start italic text-muted-foreground">Video Preview will be here</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex flex-col space-y-4">
        <Button 
          onClick={startExport}
          disabled={!isPlayerReady || isExporting}
          className="flex items-center gap-2"
        >
          {isExporting ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </Button>
        {showReenterFullscreen && (
          <Button 
            onClick={handleReenterFullscreenAndStartRecording}
            className="mt-4 text-white"
          >
            <Cpu className='w-5 h-5'/>
            Start Processing
          </Button>
        )}
      </div>
    </div>
  );
}
