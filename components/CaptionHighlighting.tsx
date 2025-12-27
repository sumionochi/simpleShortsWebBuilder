'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, Download, Upload, Image as ImageIcon, Video, X, Trash, IterationCcw, Edit, Scroll, ArrowUpDown, Plus, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from './ui/switch'
import ColorPicker from './editor/color-picker-wordhighlight'
import { useElements } from '@/hooks/elementsProvider'
import { BGM, BGMPoint } from '@/hooks/elementsProvider';

interface Caption {
  start: number
  end: number
  word: string
}

interface GroupedCaption {
  start: number
  end: number
  text: string
}

interface Frame {
  start: number;
  end: number;
  imageUrl?: string;
  videoUrl?: string;
  duration: number;
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

interface WordAction {
  wordData: WordData;
  action: 'add' | 'remove';
}

const useCaptionHighlighting = (
  audioRef: React.RefObject<HTMLAudioElement>,
  captions: Caption[],
  groupSizes: number[],
  onGroupedCaptionsUpdate: (groupedCaptions: GroupedCaption[]) => void
) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const animationFrameRef = useRef<number>()

  const updateTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
    animationFrameRef.current = requestAnimationFrame(updateTime)
  }, [audioRef])

  useEffect(() => {
    updateTime()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [updateTime])

  const groupedCaptions = React.useMemo(() => {
    const result = groupWordsByTime(captions, groupSizes)
    onGroupedCaptionsUpdate(result)
    return result
  }, [captions, groupSizes, onGroupedCaptionsUpdate])

  return { currentTime, isPlaying, setIsPlaying, groupedCaptions }
}

const groupWordsByTime = (captions: Caption[], groupSizes: number[]): GroupedCaption[] => {
  const groups: GroupedCaption[] = [];
  let sizeIndex = 0;
  let i = 0;

  while (i < captions.length) {
    let remainingWords = captions.length - i;
    let currentGroupSize = groupSizes[sizeIndex] || 1; // Default to 1 if not specified

    currentGroupSize = Math.min(currentGroupSize, remainingWords);

    // Instead of simple concatenation, consider handling special characters
    const groupWords = captions.slice(i, i + currentGroupSize).map(c => c.word);
    const groupText = groupWords.join(' ');
    const groupStart = captions[i].start;
    const groupEnd = captions[i + currentGroupSize - 1].end;

    const group: GroupedCaption = {
      start: groupStart,
      end: groupEnd,
      text: groupText,
    };

    groups.push(group);
    i += currentGroupSize;

    if (sizeIndex + 1 < groupSizes.length) {
      sizeIndex++;
    }
  }

  return groups;
};

interface WordHighlightProps { 
  time: number; 
  group: GroupedCaption; 
  selectedColor: string; 
  onWordClick: (action: WordAction) => void;
  selectedWordsData: WordData[];
}

const WordHighlight: React.FC<WordHighlightProps> = React.memo(({ time, group, selectedColor, onWordClick, selectedWordsData }) => {
  const handleWordClick = (word: string) => {
    const assignedColor = selectedColor || '#FFD700';
    const wordData: WordData = {
      word,
      color: assignedColor,
      captionStart: group.start,
      captionEnd: group.end,
    };

    const existingWord = selectedWordsData.find(
      (wc) => wc.word === word && wc.captionStart === group.start && wc.captionEnd === group.end
    );

    if (existingWord) {
      onWordClick({ wordData, action: 'remove' });
    } else {
      onWordClick({ wordData, action: 'add' });
    }
  };

  const words = group.text.split(' ');

  return (
    <>
      {words.map((word, index) => {
        const wordStart = group.start + ((group.end - group.start) / words.length) * index;
        const wordEnd = wordStart + (group.end - group.start) / words.length;
        const isHighlighted = time >= wordStart && time < wordEnd;
        const assignedColor = selectedWordsData.find(
          (wc) => wc.word === word && wc.captionStart === group.start && wc.captionEnd === group.end
        )?.color || '';
        
        return (
          <span
            key={index}
            onClick={() => handleWordClick(word)}
            style={{
              color: isHighlighted ? '#4FC394' : undefined,
              fontWeight: isHighlighted ? 'bold' : undefined,
              backgroundColor: assignedColor,
            }}
            className="cursor-pointer"
          >
            {word}{' '}
          </span>
        );
      })}
    </>
  );
});

WordHighlight.displayName = "WordHighlight";

const CaptionHighlighting = ({
  audioUrl,
  captions,
  onGroupedCaptionsUpdate,
  onFramesUpdate,
  onBgmusicUpdate,
  onBackgroundUpdateBg,
  onHighlightUpdate
}: {
  audioUrl: string
  captions: Caption[]
  onGroupedCaptionsUpdate: (groupedCaptions: GroupedCaption[]) => void
  onFramesUpdate: (frames: Frame[]) => void
  onBgmusicUpdate: (bgm: BGM[]) => void
  onBackgroundUpdateBg: (backgrounds: BackgroundBg[]) => void
  onHighlightUpdate: (highlightData: WordData[]) => void;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [groupSizes, setGroupSizes] = useState<number[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { frames: contextFrames, setFrames: setContextFrames } = useElements();
  const [frames, setFrames] = useState<Frame[]>(contextFrames);
  
  useEffect(() => {
    setFrames(contextFrames);
  }, [contextFrames]);
    
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null)

  useEffect(() => {
    if (groupSizes.length === 0) {
      const initialGroupSizes = new Array(captions.length).fill(3)
      setGroupSizes(initialGroupSizes)
    }
  }, [captions, groupSizes.length])
  

  const { currentTime, isPlaying, setIsPlaying, groupedCaptions } = useCaptionHighlighting(
    audioRef,
    captions,
    groupSizes,
    onGroupedCaptionsUpdate
  )

  useEffect(() => {
    // Synchronize frames with the parent component through the callback
    onFramesUpdate(frames);
  }, [frames, onFramesUpdate]);

  const { bgmVolume, setBgmVolume } = useElements();

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
    }
  }

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const downloadAudio = () => {
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = 'audio.mp3'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /*Frames*/

  const handleFileDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    await processFiles(files);
  };
  
  const handleFileClick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      await processFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: FileList) => {
    const uploadedFrames: Frame[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      if (frames.length === 0 && i === 0) {
        formData.append('shouldClearFrames', 'true');
      }
      const lastFrame = frames.length > 0 ? frames[frames.length - 1] : null;
      const start = lastFrame ? lastFrame.end : 0;
    
      let duration = 4;
      let videoDuration = 0;
    
      if (file.type.startsWith('video/')) {
        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(file);
        await new Promise((resolve) => {
          videoElement.onloadedmetadata = () => {
            videoDuration = videoElement.duration;
            duration = videoDuration;
            resolve(true);
          };
        });
      }
    
      try {
        console.log("reached to upload file");
        const response = await fetch('/api/uploadFiles', {
          method: 'POST',
          body: formData,
        });
    
        if (response.ok) {
          const data = await response.json();
          const timestamp = Date.now();
          const fileUrl = `${data.fileUrl}?t=${timestamp}`;
    
          uploadedFrames.push({
            start,
            end: start + duration,
            imageUrl: file.type.startsWith('image/') ? fileUrl : undefined,
            videoUrl: file.type.startsWith('video/') ? fileUrl : undefined,
            duration,
          });
    
          toast("Upload successful", {
            description: `${file.name} was uploaded successfully.`,
          });
        } else {
          const errorMessage = await response.text();
          toast("Upload error", {
            description: `Error uploading ${file.name}: ${errorMessage}`,
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast("Upload error", {
          description: `An error occurred while uploading the file.`,
        });
      }
    }
    
    setFrames((prevFrames) => [...prevFrames, ...uploadedFrames]);
  };

  const handleReplaceFileClick = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('frameIndex', index.toString());
  
    let duration = 4;
    let videoDuration = 0;
  
    if (file.type.startsWith('video/')) {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoDuration = videoElement.duration;
          duration = videoDuration;
          resolve(true);
        };
      });
    }
  
    try {
      const response = await fetch('/api/replaceFile', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        const timestamp = Date.now();
        const fileUrl = `${data.fileUrl}?t=${timestamp}`;
  
        setFrames((prevFrames) => {
          const newFrames = [...prevFrames];
          const currentFrame = newFrames[index];
          const newStart = currentFrame.start;
          const newEnd = newStart + duration;
  
          newFrames[index] = {
            ...currentFrame,
            imageUrl: file.type.startsWith('image/') ? fileUrl : undefined,
            videoUrl: file.type.startsWith('video/') ? fileUrl : undefined,
            duration,
            end: newEnd,
          };
  
          for (let i = index + 1; i < newFrames.length; i++) {
            const prevFrame = newFrames[i - 1];
            newFrames[i] = {
              ...newFrames[i],
              start: prevFrame.end,
              end: prevFrame.end + newFrames[i].duration,
            };
          }
  
          return newFrames;
        });
  
        toast("Upload successful", {
          description: `${file.name} was replaced successfully.`,
        });
      } else {
        const errorMessage = await response.text();
        toast("Upload error", {
          description: `Error replacing ${file.name}: ${errorMessage}`,
        });
      }
    } catch (error) {
      console.error('Error replacing file:', error);
      toast("Upload error", {
        description: `An error occurred while replacing the file.`,
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();

  const getFramesForCaption = (captionStart: number, captionEnd: number) => {
    return frames.filter(frame =>
      (frame.start >= captionStart && frame.start < captionEnd) ||
      (frame.end > captionStart && frame.end <= captionEnd) ||
      (frame.start <= captionStart && frame.end >= captionEnd)
    );
  }

  const deleteFrame = async (index: number) => {
    try {
      const frameToDelete = frames[index];
      const { imageUrl, videoUrl } = frameToDelete;
  
      const fileUrl = imageUrl || videoUrl;
      if (!fileUrl) {
        throw new Error('No file URL found for this frame');
      }
  
      const response = await fetch('/api/deleteFile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: fileUrl }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete file from server');
      }
  
      setFrames((prevFrames) => {
        const newFrames = prevFrames.filter((_, frameIndex) => frameIndex !== index);
  
        // Update start and end times for subsequent frames
        for (let i = index; i < newFrames.length; i++) {
          const prevFrame = newFrames[i - 1];
          newFrames[i] = {
            ...newFrames[i],
            start: i === 0 ? 0 : prevFrame.end,
            end: i === 0 ? newFrames[i].duration : prevFrame.end + newFrames[i].duration,
          };
        }
  
        return newFrames;
      });
  
      toast("Frame deleted", {
        description: `Frame ${index + 1} was deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting frame:', error);
      toast("Delete error", {
        description: `Failed to delete frame ${index + 1}.`,
      });
    }
  };

  /*Background Frame*/
  const fileInputRefBg = useRef<HTMLInputElement>(null);
  
  const {
    backgroundsBg: contextBackgroundsBg,
    setBackgroundsBg: setContextBackgroundsBg,
  } = useElements();

  const [backgroundsBg, setBackgroundsBg] = useState<BackgroundBg[]>(contextBackgroundsBg);

  useEffect(() => {
    if (backgroundsBg !== contextBackgroundsBg) {
      setBackgroundsBg(contextBackgroundsBg);
    }
  }, [contextBackgroundsBg]);
  
  useEffect(() => {
    if (backgroundsBg !== contextBackgroundsBg) {
      setContextBackgroundsBg(backgroundsBg);
    }
  }, [backgroundsBg]);  
  
  const [editingBackgroundIndexBg, setEditingBackgroundIndexBg] = useState<number | null>(null);
  const [nextIdBg, setNextIdBg] = useState(1);

  const handleFileClickBg = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      await processFilesBg(files);
    }
    if (fileInputRefBg.current) {
      fileInputRefBg.current.value = '';
    }
  };

  const handleFileDropBg = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      await processFilesBg(files);
    }
  };

  const processFilesBg = async (files: FileList) => {
    const uploadedBackgroundsBg: BackgroundBg[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const start = backgroundsBg.length > 0 ? backgroundsBg[backgroundsBg.length - 1].end : 0;
      const duration = 5;
      const id = nextIdBg;
      setNextIdBg((prevId) => prevId + 1);

      const formData = new FormData();
      formData.append('file', file);
      if (i === 0 && backgroundsBg.length === 0) {
        formData.append('shouldClearBgsounds', 'true');
      }

      try {
        const response = await fetch('/api/uploadFilesBg', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to upload');

        const data = await response.json();
        const fileUrl = data.fileUrl;

        uploadedBackgroundsBg.push({
          id,
          start,
          end: start + duration,
          duration,
          imageUrl: file.type.startsWith('image/') ? fileUrl : undefined,
          videoUrl: file.type.startsWith('video/') ? fileUrl : undefined,
        });

        toast("Background upload successful", {
          description: `${file.name} was uploaded successfully.`,
        });
      } catch (error) {
        console.error('Error uploading background:', error);
        toast("Upload error", {
          description: `Failed to upload ${file.name}.`,
        });
      }
    }

    setBackgroundsBg((prevBackgrounds) => [...prevBackgrounds, ...uploadedBackgroundsBg]);
  };

  const handleReplaceFileClickBg = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('backgroundIndex', index.toString());

    let duration = 4;
    let videoDuration = 0;

    if (file.type.startsWith('video/')) {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoDuration = videoElement.duration;
          duration = videoDuration;
          resolve(true);
        };
      });
    }

    try {
      const response = await fetch('/api/replaceFileBg', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const timestamp = Date.now();
        const fileUrl = `${data.fileUrl}?t=${timestamp}`;

        setBackgroundsBg((prevBackgrounds) => {
          const newBackgrounds = [...prevBackgrounds];
          const currentBg = newBackgrounds[index];
          const newStart = currentBg.start;
          const newEnd = newStart + duration;

          newBackgrounds[index] = {
            ...currentBg,
            imageUrl: file.type.startsWith('image/') ? fileUrl : undefined,
            videoUrl: file.type.startsWith('video/') ? fileUrl : undefined,
            duration,
            end: newEnd,
          };

          for (let i = index + 1; i < newBackgrounds.length; i++) {
            const prevBg = newBackgrounds[i - 1];
            newBackgrounds[i] = {
              ...newBackgrounds[i],
              start: prevBg.end,
              end: prevBg.end + newBackgrounds[i].duration,
            };
          }

          return newBackgrounds;
        });

        toast("Upload successful", {
          description: `${file.name} was replaced successfully.`,
        });
      } else {
        const errorMessage = await response.text();
        toast("Upload error", {
          description: `Error replacing ${file.name}: ${errorMessage}`,
        });
      }
    } catch (error) {
      console.error('Error replacing background:', error);
      toast("Upload error", {
        description: `An error occurred while replacing the background file.`,
      });
    }
  };
    
  const getBackgroundsForCaption = (captionStart: number, captionEnd: number) => {
    return backgroundsBg.filter(bg =>
      (bg.start >= captionStart && bg.start < captionEnd) ||
      (bg.end > captionStart && bg.end <= captionEnd) ||
      (bg.start <= captionStart && bg.end >= captionEnd)
    );
  }
  
  const deleteBackgroundBg = async (index: number) => {
    try {
      const backgroundToDelete = backgroundsBg[index];
      const fileUrl = backgroundToDelete.imageUrl || backgroundToDelete.videoUrl;

      if (!fileUrl) {
        throw new Error('No file URL found for this background');
      }

      const response = await fetch('/api/deleteFileBg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: fileUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete background file from server');
      }

      setBackgroundsBg((prevBackgrounds) => {
        const newBackgrounds = prevBackgrounds.filter((_, bgIndex) => bgIndex !== index);

        // Update start and end times for subsequent backgrounds
        for (let i = index; i < newBackgrounds.length; i++) {
          const prevBg = newBackgrounds[i - 1];
          newBackgrounds[i] = {
            ...newBackgrounds[i],
            start: i === 0 ? 0 : prevBg.end,
            end: i === 0 ? newBackgrounds[i].duration : prevBg.end + newBackgrounds[i].duration,
          };
        }

        return newBackgrounds;
      });

      toast("Background deleted", {
        description: `Background ${index + 1} was deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting background:', error);
      toast("Delete error", {
        description: `Failed to delete background ${index + 1}.`,
      });
    }
  };

  useEffect(() => {
    onBackgroundUpdateBg(backgroundsBg);
  }, [backgroundsBg, onBackgroundUpdateBg]);

  useEffect(() => {
    onBackgroundUpdateBg(backgroundsBg)
  }, [backgroundsBg, onBackgroundUpdateBg])

  /*BGMusic*/
  const {
    bgmTracks: contextBgmTracks,
    setBgmTracks: setContextBgmTracks,
  } = useElements();

  const [bgmTracksBGM, setBgmTracksBGM] = useState<BGM[]>(contextBgmTracks);

  useEffect(() => {
    if (bgmTracksBGM !== contextBgmTracks) {
      setBgmTracksBGM(contextBgmTracks);
    }
  }, [contextBgmTracks]);
  
  useEffect(() => {
    if (bgmTracksBGM !== contextBgmTracks) {
      setContextBgmTracks(bgmTracksBGM);
    }
  }, [bgmTracksBGM]);
  
  
  const [currentTimeBGM, setCurrentTimeBGM] = useState(0)
  const audioRefBGM = useRef<HTMLAudioElement>(null)
  const fileInputRefBGM = useRef<HTMLInputElement>(null)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)

  const handleAddBGMPoint = (bgmId: string) => {
    setBgmTracksBGM(prevTracks =>
      prevTracks.map(track => {
        if (track.id === bgmId) {
          const newPoint: BGMPoint = {
            id: track.points.length + 1,
            start: 0,
            duration: track.duration,
            end: track.duration,
            startFrom: 0,           // Default to start of audio file
            endAt: track.duration,  // Default to end of audio file
          };
          return { ...track, points: [...track.points, newPoint] };
        }
        return track;
      })
    );
  };

  const handleBGMPointChange = (
    bgmId: string,
    pointId: number,
    field: 'start' | 'duration' | 'end' | 'startFrom' | 'endAt',
    value: number
  ) => {
    setBgmTracksBGM(prevTracks =>
      prevTracks.map(track => {
        if (track.id !== bgmId) return track;
  
        const updatedPoints = track.points.map((point, index, pointsArray) => {
          if (point.id !== pointId) return point;
  
          let newStart = point.start;
          let newDuration = point.duration;
          let newEnd = point.end;
          let newStartFrom = point.startFrom;
          let newEndAt = point.endAt;
  
          if (field === 'start') {
            newStart = Math.max(0, value);
            newEnd = newStart + newDuration;
          } else if (field === 'duration') {
            newDuration = Math.max(0.01, value);
            newEnd = newStart + newDuration;
          } else if (field === 'end') {
            newEnd = Math.max(newStart + 0.01, value);
            newDuration = newEnd - newStart;
          } else if (field === 'startFrom') {
            newStartFrom = Math.max(0, Math.min(value, track.duration));
          } else if (field === 'endAt') {
            newEndAt = Math.max(newStartFrom, Math.min(value, track.duration));
          }
  
          // Update the current point
          const updatedPoint: BGMPoint = {
            ...point,
            start: newStart,
            duration: newDuration,
            end: newEnd,
            startFrom: newStartFrom,
            endAt: newEndAt,
          };
  
          return updatedPoint;
        });
  
        return { ...track, points: updatedPoints };
      })
    );
  };  

  useEffect(() => {
    const audio = audioRefBGM.current;
    if (!audio) return;
  
    const handleEnded = () => {
      setPlayingTrackId(null);
    };
  
    audio.addEventListener('ended', handleEnded);
  
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleFileUploadBGM = async (files: FileList) => {
    const formData = new FormData();
  
    // Determine whether to clear existing BGMs
    const shouldClearBgsounds = bgmTracksBGM.length === 0;
    formData.append('shouldClearBgsounds', shouldClearBgsounds.toString());
  
    for (const file of files) {
      formData.append('file', file); // Use the same key 'file' for each file
    }
  
    try {
      const response = await fetch('/api/uploadBgMusic', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        const { fileUrls } = data;
  
        const newBGMs: BGM[] = [];
  
        for (let i = 0; i < fileUrls.length; i++) {
          const fileUrl = fileUrls[i];
          const file = files[i];
          const audioElement = new Audio(fileUrl);
  
          // Wait for the metadata to load to get the duration
          await new Promise<void>((resolve) => {
            audioElement.onloadedmetadata = () => {
              const newBGM: BGM = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                url: fileUrl,
                name: file.name,
                duration: audioElement.duration,
                volume: 0.5, 
                points: [
                  {
                    id: 1,
                    start: 0,
                    duration: audioElement.duration,
                    end: audioElement.duration,
                    startFrom: 0,          
                    endAt: audioElement.duration,
                  },
                ],
                textPoints: {
                  toggle: false, // Initially off
                  ranges: [{ startTextPoint: 0, endTextPoint: audioElement.duration }], // Default range
                },
              };
              
  
              newBGMs.push(newBGM);
  
              toast('Upload successful', {
                description: `${newBGM.name} was uploaded successfully.`,
              });
              resolve();
            };
          });
        }
  
        // Update the state once after processing all files
        if (shouldClearBgsounds) {
          setBgmTracksBGM(newBGMs);
        } else {
          setBgmTracksBGM((prev) => [...prev, ...newBGMs]);
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast('Upload error', {
        description: `An error occurred while uploading the files.`,
      });
    }
  };

  const handleFileClickBGM = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await handleFileUploadBGM(files);
    }
    if (fileInputRefBGM.current) {
      fileInputRefBGM.current.value = '';
    }
  };
  
  const handleFileDropBGM = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUploadBGM(files);
    }
  };  

  const handleDeleteBGM = async (id: string) => {
    try {
      const trackToDelete = bgmTracksBGM.find(track => track.id === id)
      if (!trackToDelete) return

      const response = await fetch('/api/deleteBgMusic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: trackToDelete.url }),
      })

      if (response.ok) {
        setBgmTracksBGM(prev => prev.filter(track => track.id !== id))
        toast("Delete successful", {
          description: `BGM track was deleted successfully.`,
        })
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      toast("Delete error", {
        description: `An error occurred while deleting the file.`,
      })
    }
  }

  const handleDeleteBGMPoint = (bgmId: string, pointId: number) => {
    setBgmTracksBGM(prevTracks =>
      prevTracks.map(track => {
        if (track.id !== bgmId) return track;
  
        const updatedPoints = track.points.filter(point => point.id !== pointId);
  
        return { ...track, points: updatedPoints };
      })
    );
  };
   
  const togglePlayPauseBGM = (id: string) => {
    const track = bgmTracksBGM.find(t => t.id === id);
    if (!track) return;
  
    const audio = audioRefBGM.current;
    if (!audio) {
      console.error('Audio element is not available.');
      return;
    }
  
    if (playingTrackId === id) {
      audio.pause();
      setPlayingTrackId(null);
    } else {
      audio.src = track.url;
      audio.play();
      setPlayingTrackId(id);
  
      const handleEnded = () => {
        setPlayingTrackId(null);
        audio.removeEventListener('ended', handleEnded);
      };
  
      audio.addEventListener('ended', handleEnded);
    }
  };

  const handleToggleTextPoints = (bgmId: string) => {
    setBgmTracksBGM(prevTracks =>
      prevTracks.map(track => {
        if (track.id === bgmId) {
          return {
            ...track,
            textPoints: {
              ...track.textPoints,
              toggle: !track.textPoints.toggle,
              ranges: track.textPoints.toggle ? track.textPoints.ranges : [{ startTextPoint: 0, endTextPoint: track.duration }],
            }
          };
        }
        return track;
      })
    );
  };

  const handleTextPointRangeChange = (
    bgmId: string,
    rangeIndex: number,
    field: 'startTextPoint' | 'endTextPoint',
    value: number
  ) => {
    setBgmTracksBGM(prevTracks =>
      prevTracks.map(track => {
        if (track.id === bgmId) {
          const updatedRanges = [...track.textPoints.ranges];
          const range = { ...updatedRanges[rangeIndex] };
  
          switch (field) {
            case 'startTextPoint':
              range.startTextPoint = Math.max(0, value);
              range.endTextPoint = Math.max(range.startTextPoint + 0.1, range.endTextPoint);
              break;
  
            case 'endTextPoint':
              range.endTextPoint = Math.max(range.startTextPoint + 0.1, value);
              break;
  
            default:
              break;
          }
  
          updatedRanges[rangeIndex] = range;
  
          return {
            ...track,
            textPoints: { ...track.textPoints, ranges: updatedRanges },
          };
        }
        return track;
      })
    );
  };  

  const addTextPointRange = (bgmId: string) => {
    setBgmTracksBGM(prevTracks =>
      prevTracks.map(track => {
        if (track.id === bgmId) {
          const lastRange = track.textPoints.ranges[track.textPoints.ranges.length - 1];
          const newStartTextPoint = lastRange ? lastRange.endTextPoint : 0;
          const newEndTextPoint = Math.min(newStartTextPoint + track.duration, track.duration);
  
          return {
            ...track,
            textPoints: {
              ...track.textPoints,
              ranges: [
                ...track.textPoints.ranges,
                { startTextPoint: newStartTextPoint, endTextPoint: newEndTextPoint }
              ]
            }
          };
        }
        return track;
      })
    );
  };  

  const removeTextPointRange = (bgmId: string, rangeIndex: number) => {
    setBgmTracksBGM(prevTracks =>
      prevTracks.map(track => {
        if (track.id === bgmId) {
          const updatedRanges = track.textPoints.ranges.filter((_, index) => index !== rangeIndex);
          return { ...track, textPoints: { ...track.textPoints, ranges: updatedRanges } };
        }
        return track;
      })
    );
  }; 

  useEffect(() => {
    const audio = audioRefBGM.current
    if (!audio) return

    const updateTime = () => setCurrentTimeBGM(audio.currentTime)
    audio.addEventListener('timeupdate', updateTime)

    return () => audio.removeEventListener('timeupdate', updateTime)
  }, [])

  useEffect(() => {
    onBgmusicUpdate(bgmTracksBGM);
  }, [bgmTracksBGM, onBgmusicUpdate]);

  /*Color Words*/

  const [selectedColor, setSelectedColor] = useState('#FFD700'); 
  const {
    selectedWordsData: contextSelectedWordsData,
    setSelectedWordsData: setContextSelectedWordsData,
  } = useElements();

  const [selectedWordsData, setSelectedWordsData] = useState<WordData[]>(contextSelectedWordsData);

  useEffect(() => {
    setSelectedWordsData(contextSelectedWordsData);
  }, [contextSelectedWordsData]);

  useEffect(() => {
    setContextSelectedWordsData(selectedWordsData);
  }, [selectedWordsData]);  
  
  const [wordColors, setWordColors] = useState<WordData[]>([]);

  const handleColorChange = (value: string) => {
    setSelectedColor(value);
  };

  const handleWordSelection = ({ wordData, action }: WordAction) => {
    setSelectedWordsData((prevData) => {
      let updatedData;
  
      if (action === 'add') {
        // Add or update wordData
        updatedData = prevData.map((data) =>
          data.word === wordData.word &&
          data.captionStart === wordData.captionStart &&
          data.captionEnd === wordData.captionEnd
            ? { ...data, color: wordData.color }
            : data
        );
  
        // If wordData does not exist, add it
        if (
          !updatedData.some(
            (data) =>
              data.word === wordData.word &&
              data.captionStart === wordData.captionStart &&
              data.captionEnd === wordData.captionEnd
          )
        ) {
          updatedData.push(wordData);
        }
      } else if (action === 'remove') {
        // Remove wordData
        updatedData = prevData.filter(
          (data) =>
            !(
              data.word === wordData.word &&
              data.captionStart === wordData.captionStart &&
              data.captionEnd === wordData.captionEnd
            )
        );
      } else {
        updatedData = prevData;
      }
  
      // Ensure onHighlightUpdate is called with updated data
      onHighlightUpdate(updatedData);
      return updatedData;
    });
  };  

  const [selectedForMove, setSelectedForMove] = React.useState<number | null>(null);

  const handleMoveClick = (index: number) => {
    if (selectedForMove === null) {
      // First selection
      setSelectedForMove(index);
    } else {
      // Second selection - perform the move
      if (index !== selectedForMove) {
        const reorderedFrames = Array.from(frames);
        const [movedFrame] = reorderedFrames.splice(selectedForMove, 1);
        reorderedFrames.splice(index, 0, movedFrame);

        // Recalculate timings
        const updatedFrames = reorderedFrames.map((frame, idx) => {
          const prevEnd = idx > 0 ? reorderedFrames[idx - 1].end : 0;
          return {
            ...frame,
            start: prevEnd,
            end: prevEnd + frame.duration
          };
        });

        setFrames(updatedFrames);
      }
      setSelectedForMove(null);
    }
  };

  return (
    <div className="w-full">
      <header className='mb-2'>
        <h2 className="text-sm font-semibold mt-2">Audio, Captions and Frames (Video, Image, Gif)</h2>
      </header>
      
      <div className="space-y-2 p-2 pt-2">
        {audioUrl && (
          <div>
            <div className="">
              <Label className="text-gray-500">Audio</Label>
              <div className="flex items-center gap-4 mt-1">
                <audio preload="metadata" ref={audioRef} src={audioUrl} className="hidden" />
                <Button
                  onClick={togglePlayPause}
                  variant="outline"
                  size="icon"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[currentTime]}
                  max={audioRef.current?.duration || 100}
                  step={0.1}
                  onValueChange={handleSliderChange}
                  className="flex-grow"
                  aria-label="Audio progress"
                />
                <Button onClick={resetAudio} variant="outline" size="icon" aria-label="Reset audio">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button onClick={downloadAudio} variant="outline" size="icon" aria-label="Download audio">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {`${Math.floor(currentTime / 60)}:${(currentTime % 60)
                  .toFixed(2)
                  .padStart(5, '0')} / ${Math.floor((audioRef.current?.duration || 0) / 60)}:${(
                    (audioRef.current?.duration || 0) % 60
                  )
                    .toFixed(2)
                    .padStart(5, '0')}`}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex=row gap-4 items-end pt-2">
          <div className='w-[8.2rem]'>
            <Label htmlFor="group-size" className="text-sm text-muted-foreground">Caption Group Size</Label>
            <Input
              id="group-size"
              type="number"
              min="1"
              value={groupSizes[0]}
              onChange={(e) => setGroupSizes(new Array(captions.length).fill(Number(e.target.value)))}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground text-gray-500">Select the Highlight</Label>
            <ColorPicker
              label="Select Highlight Color"
              currentColor={selectedColor}
              handleColorChange={handleColorChange} 
            />
          </div>
        </div>

        <div>
          <div className="p-0 rounded-xl border">
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-4">
                {groupedCaptions.map((group, index) => {
                  const isActive = currentTime >= group.start && currentTime < group.end;
                  const captionFrames = getFramesForCaption(group.start, group.end);
                  const captionBackgrounds = getBackgroundsForCaption(group.start, group.end);

                  return (
                    <Card key={`caption-${index}`} className={`${isActive ? '' : ''}`}>
                      <CardContent className="p-4 gap-4 flex flex-row justify-between">
                        <div className="flex flex-col gap-2 justify-between items-start">
                          <div className="text-sm font-medium">
                            {`${group.start.toFixed(2)}s - ${group.end.toFixed(2)}s`}
                          </div>
                          <div className="text-lg">
                          <WordHighlight 
                            time={currentTime} 
                            group={group} 
                            selectedColor={selectedColor} 
                            onWordClick={handleWordSelection}
                            selectedWordsData={selectedWordsData.filter(
                              (wc) => wc.captionStart === group.start && wc.captionEnd === group.end
                            )}
                          />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`group-size-${index}`} className="text-xs">Group Size:</Label>
                            <Input
                              id={`group-size-${index}`}
                              type="number"
                              min="1"
                              max={captions.length - groupSizes.slice(0, index).reduce((sum, size) => sum + size, 0)}
                              value={groupSizes[index]}
                              onChange={(e) => setGroupSizes(prevSizes => {
                                const newSizes = [...prevSizes];
                                newSizes[index] = Number(e.target.value);
                                return newSizes;
                              })}
                              className="w-16 h-6 text-xs"
                              readOnly={index === groupSizes.length - 1}
                            />
                          </div>
                        </div>  
                        <div className="flex flex-wrap rounded-xl gap-4 overflow-scroll overflow-x-hidden w-[43rem] h-32">
                          {captionFrames.map((frame, frameIndex) => (
                            <Dialog key={`frame-dialog-${index}-${frameIndex}`}>
                              <DialogTrigger className='' asChild>
                                <div 
                                  className="relative w-[6rem] h-full cursor-pointer"
                                >
                                  {frame.imageUrl && (
                                    <img
                                      src={frame.imageUrl}
                                      alt={`Frame for caption ${index + 1}`}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  )}
                                  {frame.videoUrl && (
                                    <div className="relative w-full h-full">
                                      <video
                                        ref={(el) => {
                                          videoRefs.current[frameIndex] = el
                                        }}
                                        src={frame.videoUrl}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center rounded-b-lg">
                                    {`${frame.start.toFixed(2)}s - ${frame.end.toFixed(2)}s`}
                                  </div> 
                                </div>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] p-4">
                                <DialogHeader>
                                  <DialogTitle>Frame {frameIndex + 1}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-0">
                                  {frame.imageUrl && (
                                    <img
                                      src={frame.imageUrl}
                                      alt={`Frame for caption ${index + 1}`}
                                      className="w-full h-auto object-cover rounded-lg"
                                    />
                                  )}
                                  {frame.videoUrl && (
                                    <video
                                      ref={(el) => {
                                        videoRefs.current[frameIndex] = el
                                      }}
                                      src={frame.videoUrl}
                                      className="w-full h-auto object-cover rounded-lg"
                                      controls
                                    />
                                  )}
                                </div>
                                <div className="mt-0 text-sm">
                                  Time: {`${frame.start.toFixed(2)}s - ${frame.end.toFixed(2)}s`}
                                </div>
                                <div className="mt-0 w-full">
                                  <Button className='w-full' onClick={() => document.getElementById(`file-input-${index}-${frameIndex}`)?.click()}>
                                    Replace Frame
                                  </Button>
                                  <input
                                    type="file"
                                    id={`file-input-${index}-${frameIndex}`}
                                    className="hidden"
                                    accept="image/*,video/*"
                                    onChange={(e) => handleReplaceFileClick(e, frameIndex)}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          ))}
                          {captionBackgrounds.map((background, bgIndex) => (
                            <div key={`background-${index}-${bgIndex}`} className="relative w-[6rem] h-full cursor-pointer">
                              {background.videoUrl ? (
                                <video src={background.videoUrl} className="w-full h-full object-cover rounded-lg" controls />
                              ) : (
                                <img src={background.imageUrl} alt={`Background ${bgIndex}`} className="w-full h-full object-cover rounded-lg" />
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center rounded-b-lg">
                                {`${background.start.toFixed(2)}s - ${background.end.toFixed(2)}s`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <div className=''>
          <div className="pt-4 pb-0 space-y-1">
          <Label className="text-gray-500">Frames (Video, Image, Gif)</Label>
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upload">Upload New Frame</TabsTrigger>
              <TabsTrigger value="existing">Existing Frames</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              {(
                <div
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Drag and drop or click to upload image, GIF, or video files (multiple files allowed)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileClick}
                    className="hidden"
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="existing">
              <div className="relative w-full h-full">
                <ScrollArea className="h-[500px] w-full rounded-xl">
                  <div className="p-4">
                    {frames.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {frames.map((frame, index) => (
                          <Card
                            key={index}
                            className={`
                              transition-all duration-200 ease-in-out
                              ${selectedForMove === index ? 'ring-2 ring-primary' : ''}
                              ${selectedForMove !== null && selectedForMove !== index ? 'opacity-75' : ''}
                            `}
                          >
                            <CardContent className="p-4 flex-grow flex flex-col">
                              <div className="mb-1 text-sm font-medium flex justify-between items-center">
                                <span>Frame {index + 1}</span>
                                <Button
                                  variant={selectedForMove === index ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleMoveClick(index)}
                                  className={`ml-2 ${
                                    selectedForMove !== null ? 
                                      selectedForMove === index ? 
                                        'bg-primary text-primary-foreground' : 
                                        'border-dashed' 
                                      : ''
                                  }`}
                                >
                                  <ArrowUpDown className="w-4 h-4 mr-1" />
                                  {selectedForMove === null ? "Move" :
                                  selectedForMove === index ? "Cancel" : "Place Here"}
                                </Button>
                              </div>
                              <div className="mb-2 text-xs text-gray-500">
                                {`${frame.start.toFixed(2)}s - ${frame.end.toFixed(2)}s`}
                              </div>
                              <div className="flex-grow flex items-center justify-center mb-4">
                                {frame.imageUrl && (
                                  <img
                                    src={frame.imageUrl}
                                    alt={`Frame ${index + 1}`}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                )}
                                {frame.videoUrl && (
                                  <video
                                    ref={(el) => {
                                      videoRefs.current[index] = el;
                                    }}
                                    controls
                                    src={frame.videoUrl}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                )}
                              </div>

                              <div className="flex justify-between items-center">
                                <Button
                                  className="w-full"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingFrameIndex(editingFrameIndex === index ? null : index)}
                                >
                                  {editingFrameIndex === index ? "Hide Details" : "Edit Details"}
                                </Button>
                              </div>

                              {editingFrameIndex === index && (
                                <div className="space-y-2 mt-4">
                                <div className='flex flex-row items-center gap-2'>
                                  <Label htmlFor={`start-${index}`} className="whitespace-nowrap text-xs">
                                    Start (s):
                                  </Label>
                                  <Input
                                    id={`start-${index}`}
                                    type="number"
                                    value={frame.start}
                                    min="0"
                                    step="0.01"
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      if (newValue !== "") {
                                        const newStart = parseFloat(newValue);
                                        setFrames((prevFrames) => {
                                          const updatedFrames = [...prevFrames];
                                          updatedFrames[index] = {
                                            ...updatedFrames[index],
                                            start: newStart,
                                            end: newStart + updatedFrames[index].duration, // Update end automatically based on duration
                                          };
                                          return updatedFrames;
                                        });
                                      }
                                    }}
                                    className=" text-xs"
                                  />
                                </div>
                                <div className='flex flex-row items-center gap-2'>
                                  <Label htmlFor={`duration-${index}`} className=" whitespace-nowrap text-xs">
                                    Duration (s):
                                  </Label>
                                  <Input
                                    id={`duration-${index}`}
                                    type="number"
                                    value={frame.duration}
                                    min="0.1"
                                    step="0.01"
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      if (newValue !== "") {
                                        const newDuration = parseFloat(newValue);
                                        setFrames((prevFrames) => {
                                          const updatedFrames = [...prevFrames];
                                          updatedFrames[index] = {
                                            ...updatedFrames[index],
                                            duration: newDuration,
                                            end: updatedFrames[index].start + newDuration, // Update end automatically based on new duration
                                          };
                                          return updatedFrames;
                                        });
                                      }
                                    }}
                                    className=" text-xs"
                                  />
                                </div>
                                <div className='flex flex-row items-center gap-2'>
                                  <Label htmlFor={`end-${index}`} className="whitespace-nowrap text-xs">
                                    End (s):
                                  </Label>
                                  <Input
                                    id={`end-${index}`}
                                    type="number"
                                    value={frame.end}
                                    min="0.1"
                                    step="0.01"
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      if (newValue !== "") {
                                        const newEnd = parseFloat(newValue);
                                        setFrames((prevFrames) => {
                                          const updatedFrames = [...prevFrames];
                                          updatedFrames[index] = {
                                            ...updatedFrames[index],
                                            end: newEnd,
                                            duration: newEnd - updatedFrames[index].start, // Update duration automatically based on new end
                                          };
                                          return updatedFrames;
                                        });
                                      }
                                    }}
                                    className=" text-xs"
                                  />
                                </div>
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="p-4 pt-0 gap-2 flex justify-between items-center">
                              <Button
                                className="w-full"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`file-input-${index}`)?.click()}
                              >
                                <IterationCcw className="w-5 h-5 rotate-180" />
                              </Button>
                              <input
                                type="file"
                                id={`file-input-${index}`}
                                className="hidden"
                                accept="image/*,video/*"
                                onChange={(e) => handleReplaceFileClick(e, index)}
                              />
                              <Button
                                className="w-full"
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteFrame(index)}
                              >
                                <Trash className="w-5 h-5" />
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          No frames uploaded yet. Click the "Upload New Frame" tab to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>

      <div className='p-2 pt-0'>
        <div className="pt-4 pb-0 space-y-1">
          <Label className="text-gray-500">Backgrounds (Video, Image, Gif)</Label>
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upload">Upload New Background</TabsTrigger>
              <TabsTrigger value="existing">Existing Backgrounds</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div
                onDrop={handleFileDropBg}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRefBg.current?.click()}
                className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Drag and drop or click to upload image or video files (multiple files allowed)
                </p>
                <input
                  ref={fileInputRefBg}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileClickBg}
                  className="hidden"
                />
              </div>
            </TabsContent>
            <TabsContent value="existing">
              <ScrollArea className='h-[500px] border rounded-xl p-4'>
                {backgroundsBg.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {backgroundsBg.map((backgroundBg, index) => (
                      <Card
                        key={`background-${index}`}
                        className="cursor-pointer hover:border-primary transition-colors flex flex-col h-full"
                      >
                        <CardContent className="p-4 flex-grow flex flex-col">
                          <div className="mb-1 text-sm font-medium">Background {index + 1}</div>
                          <div className="mb-2 text-xs text-gray-500">
                            {`${backgroundBg.start.toFixed(2)}s - ${backgroundBg.end.toFixed(2)}s`}
                          </div>
                          <div className="flex-grow flex items-center justify-center mb-4">
                            {backgroundBg.imageUrl ? (
                              <img
                                src={backgroundBg.imageUrl}
                                alt={`Background ${index + 1}`}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <video
                                src={backgroundBg.videoUrl}
                                className="w-full h-full object-cover rounded-md"
                                controls
                              />
                            )}
                          </div>

                          <div className="flex justify-between items-center">
                            <Button
                              className='w-full'
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditingBackgroundIndexBg(editingBackgroundIndexBg === index ? null : index)
                              }
                            >
                              {editingBackgroundIndexBg === index ? 'Hide Details' : 'Edit Details'}
                            </Button>
                          </div>

                          {editingBackgroundIndexBg === index && (
                            <div className="space-y-2 mt-4">
                              <div className='flex flex-row items-center gap-2'>
                                <Label htmlFor={`start-${index}`} className="whitespace-nowrap text-xs">
                                  Start (s):
                                </Label>
                                <Input
                                  id={`start-${index}`}
                                  type="number"
                                  value={backgroundBg.start}
                                  min="0"
                                  step="0.1"
                                  onChange={(e) => {
                                    const newStart = parseFloat(e.target.value);
                                    setBackgroundsBg((prevBackgrounds) => {
                                      const updated = [...prevBackgrounds];
                                      updated[index] = {
                                        ...updated[index],
                                        start: newStart,
                                        end: newStart + updated[index].duration,
                                      };
                                      return updated;
                                    });
                                  }}
                                  className="text-xs w-full"
                                />
                              </div>
                              <div className='flex flex-row items-center gap-2'>
                                <Label htmlFor={`duration-${index}`} className="whitespace-nowrap text-xs">
                                  Duration (s):
                                </Label>
                                <Input
                                  id={`duration-${index}`}
                                  type="number"
                                  value={backgroundBg.duration}
                                  min="0.1"
                                  step="0.1"
                                  onChange={(e) => {
                                    const newDuration = parseFloat(e.target.value);
                                    setBackgroundsBg((prevBackgrounds) => {
                                      const updated = [...prevBackgrounds];
                                      updated[index] = {
                                        ...updated[index],
                                        duration: newDuration,
                                        end: updated[index].start + newDuration,
                                      };
                                      return updated;
                                    });
                                  }}
                                  className="text-xs w-full"
                                />
                              </div>
                              <div className='flex flex-row items-center gap-2'>
                                <Label htmlFor={`end-${index}`} className="whitespace-nowrap text-xs">
                                  End (s):
                                </Label>
                                <Input
                                  id={`end-${index}`}
                                  type="number"
                                  value={backgroundBg.end}
                                  min="0.1"
                                  step="0.1"
                                  onChange={(e) => {
                                    const newEnd = parseFloat(e.target.value);
                                    setBackgroundsBg((prevBackgrounds) => {
                                      const updated = [...prevBackgrounds];
                                      updated[index] = {
                                        ...updated[index],
                                        end: newEnd,
                                        duration: newEnd - updated[index].start,
                                      };
                                      return updated;
                                    });
                                  }}
                                  className="text-xs w-full"
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="p-4 pt-0 gap-2 flex justify-between items-center">
                          <Button
                            className='w-full'
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document.getElementById(`file-replace-bg-${index}`)?.click()
                            }
                          >
                            <IterationCcw className='w-5 h-5 rotate-180' />
                          </Button>
                          <input
                            type="file"
                            id={`file-replace-bg-${index}`}
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={(e) => handleReplaceFileClickBg(e, index)}
                          />
                          <Button
                            className='w-full'
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteBackgroundBg(index)}
                          >
                            <Trash className='w-5 h-5'/>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      No backgrounds uploaded yet. Click the "Upload New Background" tab to get started.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="w-full space-y-1 p-2">
        <Label className="text-gray-500">Background Music</Label> 
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload New BGM</TabsTrigger>
            <TabsTrigger value="existing">Existing BGM</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <div
              onDrop={handleFileDropBGM}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRefBGM.current?.click()}
              className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Drag and drop or click to upload audio files (multiple files allowed)
              </p>
              <input
                ref={fileInputRefBGM}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileClickBGM}
                className="hidden"
              />
            </div>
          </TabsContent>
          <TabsContent value="existing">
            <ScrollArea className="h-[400px] rounded-md border p-4">
            {bgmTracksBGM.map((track) => (
              <Card key={track.id} className="mb-4">
                <CardContent className="p-4">
                  {/* Display BGM name and duration */}
                  <div className="flex items-center justify-between mb-0">
                    <span className="font-medium">{track.name}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => togglePlayPauseBGM(track.id)}
                    >
                      {playingTrackId === track.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm mb-2">Duration: {track.duration} seconds</p>
                  <div className="w-full space-y-1 pt-0 mb-4">
                    <Label className="text-gray-600">Background Music Volume</Label>
                    <Slider
                      value={[track.volume]}
                      onValueChange={(value) => {
                        setBgmTracksBGM((prevTracks) =>
                          prevTracks.map((t) =>
                            t.id === track.id ? { ...t, volume: value[0] } : t
                          )
                        );
                      }}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2 border p-4 rounded-xl flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`toggle-${track.id}`}
                        checked={track.textPoints.toggle}
                        onCheckedChange={() => handleToggleTextPoints(track.id)}
                      />
                      <Label htmlFor={`toggle-${track.id}`}>Play audio on text</Label>
                    </div>                  
                    {track.textPoints.toggle && (
                      <div className="space-y-2">
                        {track.textPoints.ranges.map((range, rangeIndex) => (
                          <div key={rangeIndex} className="flex items-center gap-2">
                            <Label htmlFor={`startTextPoint-${track.id}-${rangeIndex}`}>Start Text Point:</Label>
                            <Input
                              id={`startTextPoint-${track.id}-${rangeIndex}`}
                              type="number"
                              min={0}
                              value={range.startTextPoint}
                              onChange={(e) => handleTextPointRangeChange(track.id, rangeIndex, 'startTextPoint', Number(e.target.value))}
                              className="w-24"
                            />
                            <Label htmlFor={`endTextPoint-${track.id}-${rangeIndex}`}>End Text Point:</Label>
                            <Input
                              id={`endTextPoint-${track.id}-${rangeIndex}`}
                              type="number"
                              min={range.startTextPoint + 0.1}
                              value={range.endTextPoint}
                              onChange={(e) => handleTextPointRangeChange(track.id, rangeIndex, 'endTextPoint', Number(e.target.value))}
                              className="w-24"
                              step={0.1}
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeTextPointRange(track.id, rangeIndex)}
                              aria-label="Remove text point range"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => addTextPointRange(track.id)} className="mt-0">
                              <Plus className='w-5 h-5'/>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>


                  {/* BGM Points */}
                  <div className="mt-4 flex flex-col gap-2">
                    <div className='flex flex-row gap-2'>
                    <Button onClick={() => handleAddBGMPoint(track.id)} className=''>
                      <Music/>
                      Add BGM Point
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteBGM(track.id)}>
                      <Trash className="h-5 w-5" />
                      Delete BGM Point
                    </Button>
                    </div>
                    {track.points.map(point => (
                      <div key={point.id} className="mt-2 p-4 border rounded-xl flex flex-col items-start gap-4">
                        <div className='flex flex-row gap-4'>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`point-start-${point.id}`} className="w-10">Start:</Label>
                            <Input
                              id={`point-start-${point.id}`}
                              type="number"
                              value={point.start}
                              onChange={(e) =>
                                handleBGMPointChange(
                                  track.id,
                                  point.id,
                                  'start',
                                  Number(e.target.value)
                                )
                              }
                              min={0}
                              step={0.1}
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-0">
                            <Label htmlFor={`point-duration-${point.id}`} className="w-16">Duration:</Label>
                            <Input
                              id={`point-duration-${point.id}`}
                              type="number"
                              value={point.duration}
                              onChange={(e) =>
                                handleBGMPointChange(
                                  track.id,
                                  point.id,
                                  'duration',
                                  Number(e.target.value)
                                )
                              }
                              min={0.1}
                              step={0.1}
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-0">
                            <Label htmlFor={`point-end-${point.id}`} className="w-10">End:</Label>
                            <Input
                              id={`point-end-${point.id}`}
                              type="number"
                              value={point.end}
                              onChange={(e) =>
                                handleBGMPointChange(
                                  track.id,
                                  point.id,
                                  'end',
                                  Number(e.target.value)
                                )
                              }
                              min={point.start + 0.1}
                              step={0.1}
                            />
                            {point.end < point.start + 0.1 && (
                            <p className="text-red-500 text-xs">End must be greater than Start by at least 0.1 seconds.</p>
                          )}
                          </div>
                        </div>
                        <div className='flex flex-row gap-4 justify-between w-full'>
                          <div className='flex flex-row gap-4'>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`startFrom-${point.id}`} className="w-20 whitespace-nowrap">Trim From:</Label>
                            <Input
                              id={`startFrom-${point.id}`}
                              type="number"
                              value={point.startFrom}
                              onChange={(e) =>
                                handleBGMPointChange(
                                  track.id,
                                  point.id,
                                  'startFrom',
                                  Number(e.target.value)
                                )
                              }
                              min={0}
                              max={track.duration}
                              step={0.1}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`endAt-${point.id}`} className="w-20 whitespace-nowrap">Trim To:</Label>
                            <Input
                              id={`endAt-${point.id}`}
                              type="number"
                              value={point.endAt}
                              onChange={(e) =>
                                handleBGMPointChange(
                                  track.id,
                                  point.id,
                                  'endAt',
                                  Number(e.target.value)
                                )
                              }
                              min={point.startFrom}
                              max={track.duration}
                              step={0.1}
                            />
                          </div>
                          </div>
                          <div className="flex justify-end mt-0">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBGMPoint(track.id, point.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                          </div>   
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-0">
                  
                </CardFooter>
              </Card>
            ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <audio ref={audioRefBGM} className="hidden" />
      </div>
    </div>
  )
}

export default CaptionHighlighting;