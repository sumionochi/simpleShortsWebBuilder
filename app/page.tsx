"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { BookOpen, ClipboardCopy, Download, GripHorizontal, Heart, Lightbulb, Loader, RotateCcw, Save, StopCircle, X } from 'lucide-react'
import { toast } from "sonner"  
import { Textarea } from '@/components/ui/textarea'
import { FileVideo, FileText } from 'lucide-react';
import {  GraduationCap, Smile, Ghost, Puzzle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Play, Pause } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Upload, Mic } from 'lucide-react'
import { useDropzone } from 'react-dropzone';
import CaptionHighlighting from '@/components/CaptionHighlighting';
import RemotionComponent1 from '@/remotion/remotionComponents/RemotionComponent1';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable'
import { useMediaQuery } from "react-responsive";
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FontFamilyPicker from '@/components/editor/font-picker';
import ColorPicker from '@/components/editor/color-picker';
import FontFamilyPickerSec from '@/components/editor/font-picker-sec';
import ColorPickerSec from '@/components/editor/color-picker-sec';
import BackgroundColorPicker from '@/components/editor/background-color-picker';
import '@/app/fonts.css'
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useElements } from '@/hooks/elementsProvider';
import { BGM, BGMPoint } from '@/hooks/elementsProvider';

export interface GroupedCaption {
  start: number;
  end: number;
  text: string;
}

interface Caption {
  start: number
  end: number
  word: string
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

interface ProgressItem {
  id: string;
  name: string;
}

export default function Category() {
/*
  const {
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
    textSegmentsSec,
    setTextSegmentsSec,
    perWordCaptions,
    setPerWordCaptions,
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
  } = useElements();  */

  /*Generate Script*/
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState('Custom Topic');
  const { audioUrl, setAudioUrl } = useElements();
  const {captions, setCaptions} = useElements();
  const [newCaption, setNewCaption] = useState({ start: '', end: '', word: '' });
  const [seconds, setSeconds] = useState(25)
  const [words, setWords] = useState(58)
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<'gpt-4' | 'gpt-4o'>('gpt-4')

  const handleToggle = (checked: boolean) => {
    setModel(checked ? 'gpt-4' : 'gpt-4o')
  }

  useEffect(() => {
    const calculatedWords = Math.round(23 + (seconds - 10) * (280 - 23) / (120 - 10))
    setWords(calculatedWords)
  }, [seconds])

  const topics = [
    { name: 'Custom Topic', icon: <BookOpen className='w-5 h-5' /> },               // General icon for any topic
    { name: 'History Facts', icon: <GraduationCap className='w-5 h-5' /> },       // GraduationCap for educational/history topics
    { name: 'Motivational', icon: <Heart className='w-5 h-5' /> },                // Heart for motivational content
    { name: 'Life Pro Tips', icon: <Lightbulb className='w-5 h-5' /> },           // Lightbulb for tips/advice
    { name: 'Tutorial', icon: <FileText className='w-5 h-5' /> },                 // FileText for tutorials and guides
    { name: 'Explainer', icon: <Lightbulb className='w-5 h-5' /> },               // Lightbulb for explainers or instructional content
    { name: 'Philosophy', icon: <BookOpen className='w-5 h-5' /> },               // BookOpen for philosophy and deep thinking
    { name: 'Simple Short Story', icon: <Smile className='w-5 h-5' /> },          // Smile for a light, simple story
    { name: 'Short Story', icon: <FileText className='w-5 h-5' /> },              // FileText for a more structured short story
    { name: 'Children\'s Story', icon: <Smile className='w-5 h-5' /> },           // Smile for a cheerful children's story
    { name: 'Mystery Story', icon: <Puzzle className='w-5 h-5' /> },              // Puzzle for mystery or detective stories
    { name: 'Horror Story', icon: <Ghost className='w-5 h-5' /> },
  ];

  const handleSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/generateScript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt,
          selectedGenre: selectedTopic,
          seconds: seconds,
          words: words,
          modelGPT: model  
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setGeneratedScript(data.script)
      } else {
        throw new Error('Failed to generate script')
      }
    } catch (error) {
      toast("Error", {
        description: "There was an error generating your video. Please try again.",
        action: {
          label: "Retry",
          onClick: () => {
            handleSubmit(e)
          },
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /*Generate Audio*/
  const voices = [
    { id: 'alloy', name: 'Alloy', description: 'British, Warm, Middle aged, Female', audioSrc: 'https://cdn.openai.com/API/docs/audio/alloy.wav' },
    { id: 'echo', name: 'Echo', description: 'British, Authoritative, Middle aged, Male', audioSrc: 'https://cdn.openai.com/API/docs/audio/echo.wav' },
    { id: 'fable', name: 'Fable', description: 'American, Deep, Middle aged, Male', audioSrc: 'https://cdn.openai.com/API/docs/audio/fable.wav' },
    { id: 'onyx', name: 'Onyx', description: 'American, Expressive, Young, Female', audioSrc: 'https://cdn.openai.com/API/docs/audio/onyx.wav' },
    { id: 'nova', name: 'Nova', description: 'Swedish, Seductive, Young, Female', audioSrc: 'https://cdn.openai.com/API/docs/audio/nova.wav' },
    { id: 'shimmer', name: 'Shimmer', description: 'Transatlantic, Intense, Middle aged, Male', audioSrc: 'https://cdn.openai.com/API/docs/audio/shimmer.wav' },
  ]
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [credits, setCredits] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({})
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id)
  const { groupedCaptions, setGroupedCaptions } = useElements();
  const { frames, setFrames } = useElements();
  const { bgmTracks, setBgmTracks } = useElements();
  const { backgroundsBg, setBackgroundsBg } = useElements();
  const { selectedWordsData, setSelectedWordsData } = useElements();


  const formatTime = (seconds: number) => {
    const totalMilliseconds = Math.round(seconds * 1000);
    const hours = Math.floor(totalMilliseconds / (3600 * 1000));
    const minutes = Math.floor((totalMilliseconds % (3600 * 1000)) / (60 * 1000));
    const secs = Math.floor((totalMilliseconds % (60 * 1000)) / 1000);
    const milliseconds = totalMilliseconds % 1000;
  
    const pad = (num: number, size: number) => num.toString().padStart(size, '0');
  
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)},${pad(milliseconds, 3)}`;
  };
  
  const captionsToSRT = (groupedCaptions: GroupedCaption[]): string => {
    return groupedCaptions.map((group, index) => {
  
      const startTime = formatTime(group.start);
      const endTime = formatTime(group.end);
    
      const text = group.text;
  
      return `${index + 1}\n${startTime} --> ${endTime}\n${text}\n`;
    }).join('\n');
  };

  const handleGroupedCaptionsUpdate = (updatedGroupedCaptions: GroupedCaption[]) => {
    setGroupedCaptions(prevGroupedCaptions => {
      const newSRT = captionsToSRT(updatedGroupedCaptions);
      const prevSRT = captionsToSRT(prevGroupedCaptions);
  
      const isDifferent = newSRT !== prevSRT;
      return isDifferent ? updatedGroupedCaptions : prevGroupedCaptions;
    });
  };    

  const handleFramesUpdate = (newFrames: Frame[]) => {
    setFrames((prevFrames) => {
      if (prevFrames.length !== newFrames.length) {
        return newFrames;
      }
  
      const areFramesDifferent = JSON.stringify(prevFrames) !== JSON.stringify(newFrames);
  
      const areFramesDifferentDetailed = prevFrames.some((prevFrame, index) => {
        const newFrame = newFrames[index];
        return (
          prevFrame.start !== newFrame.start ||
          prevFrame.end !== newFrame.end ||
          prevFrame.duration !== newFrame.duration ||
          prevFrame.imageUrl !== newFrame.imageUrl || 
          prevFrame.videoUrl !== newFrame.videoUrl    
        );
      });
  
      if (areFramesDifferent || areFramesDifferentDetailed) {
        return newFrames;
      }
  
      return prevFrames;
    });
  };

  const handleBackgroundsUpdate = (newBackgrounds: BackgroundBg[]) => {
    setBackgroundsBg((prevBackgrounds) => {
      if (prevBackgrounds.length !== newBackgrounds.length) {
        return newBackgrounds;
      }
  
      const areBackgroundsDifferent = JSON.stringify(prevBackgrounds) !== JSON.stringify(newBackgrounds);
  
      const areBackgroundsDifferentDetailed = prevBackgrounds.some((prevBackground, index) => {
        const newBackground = newBackgrounds[index];
        return (
          prevBackground.start !== newBackground.start ||
          prevBackground.end !== newBackground.end ||
          prevBackground.duration !== newBackground.duration ||
          prevBackground.imageUrl !== newBackground.imageUrl || 
          prevBackground.videoUrl !== newBackground.videoUrl
        );
      });
  
      if (areBackgroundsDifferent || areBackgroundsDifferentDetailed) {
        return newBackgrounds;
      }
  
      return prevBackgrounds;
    });
  };  
  
  const handleBgmusicUpdate = (newBgmusic: BGM[]) => {
    setBgmTracks((prevBgmusic) => {
      if (prevBgmusic.length !== newBgmusic.length) {
        return newBgmusic;
      }
  
      for (let i = 0; i < newBgmusic.length; i++) {
        if (
          prevBgmusic[i].id !== newBgmusic[i].id ||
          prevBgmusic[i].url !== newBgmusic[i].url ||
          prevBgmusic[i].name !== newBgmusic[i].name ||
          prevBgmusic[i].duration !== newBgmusic[i].duration ||
          JSON.stringify(prevBgmusic[i].points) !== JSON.stringify(newBgmusic[i].points) ||
          prevBgmusic[i].textPoints.toggle !== newBgmusic[i].textPoints.toggle ||
          JSON.stringify(prevBgmusic[i].textPoints.ranges) !== JSON.stringify(newBgmusic[i].textPoints.ranges) // Added check for ranges
        ) {
          return newBgmusic;
        }
      }
  
      return prevBgmusic;
    });
  };    

  const handleHighlightUpdate = (newHighlightData: WordData[]) => {
    console.log(selectedWordsData);
    setSelectedWordsData((prevData: WordData[]) => {
      if (prevData.length !== newHighlightData.length) {
        return newHighlightData;
      }
  
      for (let i = 0; i < newHighlightData.length; i++) {
        if (
          prevData[i].word !== newHighlightData[i].word ||
          prevData[i].color !== newHighlightData[i].color ||
          prevData[i].captionStart !== newHighlightData[i].captionStart ||
          prevData[i].captionEnd !== newHighlightData[i].captionEnd
        ) {
          return newHighlightData;
        }
      }
  
      return prevData;
    });
  };

  useEffect(() => {
    const charCountValue = generatedScript.length
    setCharCount(charCountValue)

    const creditsValue = Math.ceil(charCountValue / 133)
    setCredits(creditsValue)

    const videoDurationValue = (charCountValue / 133) * 7.98
    setVideoDuration(videoDurationValue)
  }, [generatedScript])

  const handleSubmitScript = async () => {
    try {
      setIsGeneratingAudio(true)
      const res = await fetch('/api/generateAudioCaptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          script: generatedScript, 
          voice: selectedVoice 
        }),
      })

      if (res.ok) {
        const data = await res.json()
        console.log("Here is the audio",data.url, data.message, data.captions);
        setAudioUrl(data.url);
        setCaptions(data.captions);

        toast("Audio Generation", {
          description: "Your audio and captions have been generated successfully!",
          action: {
            label: "Play Audio",
            onClick: () => {
              const audio = new Audio(data.url)
              audio.play()
            },
          },
        })
      } else {
        throw new Error('Failed to generate audio')
      }
    } catch (error) {
      toast("Error", {
        description: "There was an error generating your audio. Please try again.",
      })
    } finally {
      setIsGeneratingAudio(false)
    }
  }
  const toggleAudio = (voiceId: string) => {
    const audioElement = audioRefs.current[voiceId]
    if (audioElement) {
      if (playingAudio === voiceId) {
        audioElement.pause()
        setPlayingAudio(null)
      } else {
        if (playingAudio) {
          audioRefs.current[playingAudio]?.pause()
        }
        audioElement.currentTime = 0
        audioElement.play()
        setPlayingAudio(voiceId)
      }
    }
  }

  /*Upload Recorded Audio */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]); 
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': [] }, 
    maxFiles: 1,
  });

  const handleCaptionChange = (
    index: number,
    field: keyof Caption,
    value: string | number
  ) => {
    setCaptions((prevCaptions) => {
      const updatedCaptions = [...prevCaptions];
      updatedCaptions[index] = { ...updatedCaptions[index], [field]: value };
      return updatedCaptions;
    });
  };

  const handleDeleteCaption = (index: number) => {
    setCaptions((prevCaptions) => prevCaptions.filter((_, i) => i !== index));
  };

  const handleAddCaption = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { start, end, word } = newCaption;
    const newCaptionObj: Caption = { start: parseFloat(start as string), end: parseFloat(end as string), word: word.trim().replace(/\s+/g, '') };
    setCaptions((prevCaptions) => {
      const updatedCaptions = [...prevCaptions, newCaptionObj];
      updatedCaptions.sort((a, b) => a.start - b.start);
      return updatedCaptions;
    });
    setNewCaption({ start: '', end: '', word: '' });
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault(); 
  
    if (!selectedFile) {
      toast("Error", { description: "No file selected" });
      return;
    }
  
    setIsUploading(true);
  
    const formData = new FormData();
    formData.append('audio', selectedFile); 
  
    try {
      const res = await fetch('/api/uploadAudioGenerateCaptions', {
        method: 'POST',
        body: formData, 
      });
  
      if (res.ok) {
        const data = await res.json();
        toast("Upload Successful", { description: "Audio uploaded successfully" });
        setAudioUrl(data.url); 
        setCaptions(data.captions);  
        console.log("Transcription: ", data.transcription);
        console.log("Captions: ", data.captions);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast("Error", {
        description: "There was an error uploading your file. Please try again.",
        action: {
          label: "Retry",
          onClick: () => {
            handleFileUpload(e);
          },
        },
      });
    } finally {
      setIsUploading(false);
    }
  };  

  const handleRemoveFile = () => {
    setSelectedFile(null); 
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };


  /*Generate Images */
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      const handleWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0) {
          e.preventDefault()
          container.scrollLeft += e.deltaY
        }
      }
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const useIsLargeScreen = () => {
    return useMediaQuery({ minWidth: 1024 }); 
  };

  /*Step 4 frame*/
  const { frameTemplateMap, setFrameTemplateMap } = useElements();
  const [uniqueStartTimes, setUniqueStartTimes] = useState<number[]>([]);
  const { frameStyles, setFrameStyles } = useElements();

  useEffect(() => {
    const uniqueTimes = Array.from(new Set(frames.map(frame => frame.start)));
    setUniqueStartTimes(uniqueTimes);
  }, [frames]);

  const handleTemplateSelect = (startTime: number, template: string) => {
    setFrameTemplateMap(prev => ({
      ...prev,
      [startTime]: template 
    }));

    if (!frameStyles[startTime]) {
      setFrameStyles((prev) => ({
        ...prev,
        [startTime]: {
          width: '100%',
          height: '100%',
          objectPosition: 'center',
          objectFit: 'cover',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0rem',
          borderRadius: '0rem',
          boxShadow: '30px 30px 12px rgba(0, 0, 0, 0.4)',
          borderStyle: 'solid',
          borderWidth: '0rem',
          borderColor: 'transparent',
          overflow: 'hidden',
        },
      }));
    }    
  };

  const handleFrameStyleChange = (startTime: number, property: keyof FrameStyle, value: string) => {
    setFrameStyles(prev => ({
      ...prev,
      [startTime]: {
        ...prev[startTime],
        [property]: value
      }
    }));
  };

  /*Step 4 primary text*/
  const { textSegments, setTextSegments } = useElements();
  const [newSegment, setNewSegment] = useState<Omit<TextSegment, 'id'>>({
    start: 0,
    duration: 2,
    end: 2,
    style: {
      fontFamily: 'Arial',
      color: '#000000',
      fontSize: '4rem',
      fontWeight: 400,
      opacity: 1,
      transform: 'rotate(0deg)',
      left: '0%',
      top: '0%',
      lineHeight: '1.2',
      width: '100%',
      height: 'auto',
      stack: 1,
      place: 'center',
    },
  });
  

  const { paddingBetweenLines, setPaddingBetweenLines, paddingFromFrame, setPaddingFromFrame } = useElements();


  const handleAddSegment = (e: React.FormEvent) => {
    e.preventDefault();
    const newSegmentWithId = { ...newSegment, id: Date.now().toString() };
    setTextSegments((prev) => [...prev, newSegmentWithId]);
    setNewSegment({
      start: newSegment.end,
      duration: 2,
      end: newSegment.end + 2,
      style: {
        fontFamily: 'Arial',
        color: '#000000',
        fontSize: '4rem',
        fontWeight: 400,
        opacity: 1,
        transform: 'rotate(0deg)',
        left: '0%',
        top: '0%',
        lineHeight: '1.2',
        width: '100%',
        height: 'auto',
        stack: 1,
        place: 'center',
      },
    });
  };

  const updateSegment = (id: string, field: keyof TextSegment, value: any) => {
    setTextSegments((prev) =>
      prev.map((segment) => (segment.id === id ? { ...segment, [field]: value } : segment))
    );
  };

  const updateSegmentStyle = (id: string, styleField: keyof TextSegment['style'], value: any) => {
    setTextSegments((prev) =>
      prev.map((segment) =>
        segment.id === id ? { ...segment, style: { ...segment.style, [styleField]: value } } : segment
      )
    );
  };

  /*Step 4 Secondary Text */
  const {secondaryTextSegmentsSec, setSecondaryTextSegmentsSec} = useElements();
  const [newSegmentSec, setNewSegmentSec] = useState<Omit<SecondaryTextSegment, 'id'>>({
    text: '',
    start: 0,
    duration: 2,
    end: 2,
    style: {
      fontFamily: 'Arial',
      color: '#000000',
      fontSize: '4rem',
      fontWeight: 400,
      opacity: 1,
      transform: 'rotate(0deg)',
      left: '0%',
      top: '0%',
      lineHeight: '1.2',
      width: '100%',
      height: 'auto',
      stack: 1,
      place: 'center',
    },
  });
  const onSecondaryTextUpdateSec = (updatedSegments: SecondaryTextSegment[]) => {
    setSecondaryTextSegmentsSec(updatedSegments);
  };

  const handleAddSegmentSec = (e: React.FormEvent) => {
    e.preventDefault();
    const newSegmentWithId = { ...newSegmentSec, id: Date.now().toString() };
    setSecondaryTextSegmentsSec(prev => [...prev, newSegmentWithId]);
    onSecondaryTextUpdateSec([...secondaryTextSegmentsSec, newSegmentWithId]);
    setNewSegmentSec({
      text: '',
      start: newSegmentSec.end,
      duration: 2,
      end: newSegmentSec.end + 2,
      style: { ...newSegmentSec.style },
    });
  };

  const updateSegmentSec = (id: string, field: keyof SecondaryTextSegment, value: any) => {
    setSecondaryTextSegmentsSec(prev => {
      const updated = prev.map(segment =>
        segment.id === id ? { ...segment, [field]: value } : segment
      );
      onSecondaryTextUpdateSec(updated);
      return updated;
    });
  };

  const updateSegmentStyleSec = (
    id: string,
    styleField: keyof SecondaryTextSegment['style'],
    value: any
  ) => {
    setSecondaryTextSegmentsSec((prev) =>
      prev.map((segment) =>
        segment.id === id
          ? { ...segment, style: { ...segment.style, [styleField]: value } }
          : segment
      )
    );
  };  

  const handleDeleteSegmentSec = (id: string) => {
    setSecondaryTextSegmentsSec((prev) => prev.filter((segment) => segment.id !== id));
  };  

  /*Step 4 Transition Video*/
  const [transitionVideos, setTransitionVideos] = useState<File[]>([])
  const { transitionVideoUrl, setTransitionVideoUrl, transitionVolume, setTransitionVolume } = useElements();
  const [selectedTransitions, setSelectedTransitions] = useState<{ [key: number]: string }>({})
  
  const handleTransitionVideoUpload = (files: File[]) => {
    setTransitionVideos(prevVideos => [...prevVideos, ...files])
    toast('Success', { description: 'Transition videos selected successfully' })
  }

  const handleTransitionVideoSubmit = async () => {
    if (transitionVideos.length === 0) {
      toast('Error', { description: 'No transition videos selected' })
      return
    }

    const formData = new FormData()
    transitionVideos.forEach((video, index) => {
      formData.append(`transitionVideo${index}`, video)
    })

    try {
      const res = await fetch('/api/uploadTransition', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        toast('Success', { description: data.message })

        const newTransitionVideoUrl = data.filenames.map((filename: string) => `/transitions/${filename}`)
        setTransitionVideoUrl(prevUrls => [...prevUrls, ...newTransitionVideoUrl])
        setTransitionVolume(prevVolumes => [...prevVolumes, ...new Array(data.filenames.length).fill(100)])
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading transition videos:', error)
      toast('Error', { description: 'There was an error uploading your transition videos. Please try again.' })
    }
  }

  const handleRemoveTransitionVideo = async (index: number) => {
    const filename = transitionVideoUrl[index].split('/').pop(); // Extract filename from URL
  
    if (!filename) {
      toast('Error', { description: 'Invalid filename' });
      return;
    }
  
    try {
      const res = await fetch('/api/removeTransition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });
  
      if (res.ok) {
        const data = await res.json();
        toast('Success', { description: data.message });
  
        // Remove the video from the state
        setTransitionVideos((prevVideos) => prevVideos.filter((_, i) => i !== index));
        setTransitionVideoUrl((prevUrls) => prevUrls.filter((_, i) => i !== index));
        setTransitionVolume((prevVolumes) => prevVolumes.filter((_, i) => i !== index));
  
        // Update selectedTransitions
        setSelectedTransitions((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            if (updated[parseInt(key)] === transitionVideoUrl[index]) {
              updated[parseInt(key)] = 'no-transition'; // Or null, based on your implementation
            }
          });
          return updated;
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete the transition video');
      }
    } catch (error) {
      console.error('Error deleting transition video:', error);
      toast('Error', { description: 'There was an error deleting the transition video. Please try again.' });
    }
  };  

  const handleTransitionSelect = (index: number, value: string) => {
    setSelectedTransitions(prev => {
      const newState = { ...prev };
      if (value === 'no-transition') {
        delete newState[index];
      } else {
        newState[index] = value;
      }
      return newState;
    });
  }; 

  const handleVolumeChange = (index: number, value: number) => {
    setTransitionVolume(prevVolumes => {
      const newVolumes = [...prevVolumes]
      const transitionIndex = transitionVideoUrl.indexOf(selectedTransitions[index])
      if (transitionIndex !== -1) {
        newVolumes[transitionIndex] = value
      }
      return newVolumes
    })
  }

  const {
    getRootProps: getTransitionRootProps,
    getInputProps: getTransitionInputProps,
  } = useDropzone({
    onDrop: handleTransitionVideoUpload,
    accept: { 'video/*': [] },
    multiple: true,
  }) 

  /*Background Color Picker*/
  const { backgroundColor, setBackgroundColor } = useElements();

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
  };
  
  const isLargeScreens = useIsLargeScreen();

  /*Storing Progress and Restoring*/
  const [savedProgressList, setSavedProgressList] = useState<ProgressItem[]>([]);
  const [selectedProgressId, setSelectedProgressId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [progressName, setProgressName] = useState('')
  const [isRestoring, setIsRestoring] = useState(false)
  const [progressToDelete, setProgressToDelete] = useState<string | null>(null)
  const [isOverwrite, setIsOverwrite] = useState(false);
  const [selectedOverwriteId, setSelectedOverwriteId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setProfile(profileData);
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [supabase]);

  useEffect(() => {
    if (profile?.id) {
      fetchSavedProgressList(profile.id);
    }
  }, [profile?.id]);

  const fetchSavedProgressList = async (profileId: string) => {
    try {
      const res = await fetch(`/api/getSavedProgress?profile_id=${profileId}`);
      if (res.ok) {
        const data = await res.json();
        setSavedProgressList(data.progressList);
      } else {
        throw new Error('Failed to fetch saved progress.');
      }
    } catch (error) {
      console.log("No saved progress detected")
    }
  };

  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      if (!profile?.id) {
        toast("Error", { description: "Unable to find profile ID." });
        return;
      }
  
      // Determine the name for the progress
      let finalProgressName = progressName;
  
      // If overwriting, use the existing name of the progress being overwritten
      if (isOverwrite && selectedOverwriteId) {
        const progressToOverwrite = savedProgressList.find(
          (progress) => progress.id === selectedOverwriteId
        );
        if (progressToOverwrite) {
          finalProgressName = progressToOverwrite.name;
        }
      } else if (!progressName) {
        // If it's a new save and no name is provided, show an error
        toast("Error", { description: "Progress name is required." });
        setIsSaving(false);
        return;
      }
  
      // Prepare the data to be saved, conditionally including name
      const progressData = {
        profile_id: profile.id,
        ...(finalProgressName && { name: finalProgressName }), // Only include `name` if present
        generatedScript: generatedScript || "No script content",
        selectedTopic,
        audioUrl,
        captions,
        newCaption,
        seconds,
        words,
        prompt,
        model,
        selectedVoice,
        groupedCaptions,
        frames,
        bgmTracks,
        backgroundsBg,
        selectedWordsData,
        frameTemplateMap,
        frameStyles,
        textSegments,
        newSegment,
        paddingBetweenLines,
        paddingFromFrame,
        secondaryTextSegmentsSec,
        newSegmentSec,
        transitionVideoUrl,
        transitionVolume,
        selectedTransitions,
        backgroundColor,
      };
  
      // Set the API URL and method based on whether it's an overwrite or new save
      const apiUrl = isOverwrite && selectedOverwriteId
        ? `/api/updateProgress?id=${selectedOverwriteId}`
        : "/api/saveProgress";
      const method = isOverwrite && selectedOverwriteId ? "PUT" : "POST";
  
      const res = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progressData),
      });
  
      if (res.ok) {
        toast("Success", { description: "Progress saved successfully." });
        fetchSavedProgressList(profile.id);
        setIsDialogOpen(false);
      } else {
        throw new Error("Failed to save progress.");
      }
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreProgress = async () => {
    if (!selectedProgressId) {
      toast('Error', { description: 'Please select a saved progress to restore.' });
      return;
    }
    setIsRestoring(true)

    try {
      const res = await fetch(`/api/loadProgress?id=${selectedProgressId}`);
      if (res.ok) {
        const data = await res.json();
        // Update all the state variables with the loaded data
        setGeneratedScript(data.generatedScript);
        setSelectedTopic(data.selectedTopic);
        setAudioUrl(data.audioUrl);
        setCaptions(data.captions);
        setNewCaption(data.newCaption);
        setSeconds(data.seconds);
        setWords(data.words);
        setPrompt(data.prompt);
        setModel(data.model);
        setSelectedVoice(data.selectedVoice);
        setGroupedCaptions(data.groupedCaptions);
        setFrames(data.frames);
        setBgmTracks(data.bgmTracks);
        setBackgroundsBg(data.backgroundsBg);
        setSelectedWordsData(data.selectedWordsData);
        setFrameTemplateMap(data.frameTemplateMap);
        setFrameStyles(data.frameStyles);
        setTextSegments(data.textSegments);
        setNewSegment(data.newSegment);
        setPaddingBetweenLines(data.paddingBetweenLines);
        setPaddingFromFrame(data.paddingFromFrame);
        setSecondaryTextSegmentsSec(data.secondaryTextSegmentsSec);
        setNewSegmentSec(data.newSegmentSec);
        setTransitionVideoUrl(data.transitionVideoUrl);
        setTransitionVolume(data.transitionVolume);
        setSelectedTransitions(data.selectedTransitions);
        setBackgroundColor(data.backgroundColor);
  
        toast('Success', { description: 'Progress restored successfully.' });
      } else {
        throw new Error('Failed to load progress.');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast('Error', { description: error.message });
      } else {
        toast('Error', { description: 'An unknown error occurred.' });
      }
    } finally {
      setIsRestoring(false)
    }
  }; 

  const handleDeleteProgress = async (progressId: string) => {
    try {
      const res = await fetch(`/api/deleteProgress?id=${progressId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast("Success", {
          description: "Progress deleted successfully.",
        })
        setSavedProgressList(savedProgressList.filter((progress) => progress.id !== progressId))
      } else {
        throw new Error("Failed to delete progress.")
      }
    } catch (error) {
      toast("Error", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        className: 'bg-rose-500'
      })
    }
  }  

  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
      setDraggablePosition({ x: 0, y: 0 });
      updateBounds();
    };

    const updateBounds = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const panelWidth = 100; // Match your panel width
      const panelHeight = 100; 
      setBounds({
        left: -(viewportWidth- panelWidth), 
        top: -(viewportHeight - panelHeight), 
        right: 0,
        bottom: 0
      });
    };

    checkScreenSize();
    updateBounds();
    
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleDrag = (_e: DraggableEvent, ui: DraggableData) => {
    const { x, y } = ui;
    setDraggablePosition({ x, y });
  };

  return (
    <main className="gap-0">   
      <div className='flex w-full gap-6 p-4 min-w-screen items-start justify-between flex-col'>
        <div className="flex items-center gap-4 flex-wrap">
          <Button onClick={() => setIsDialogOpen(true)} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Progress'}
          </Button>

          <Select value={selectedProgressId || undefined} onValueChange={setSelectedProgressId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Saved Progress" />
            </SelectTrigger>
            <SelectContent>
              {savedProgressList?.length > 0 ? (
                savedProgressList.map((progress) => (
                  <div key={progress.id} className="flex items-center justify-between">
                    <SelectItem value={progress.id}>{progress.name}</SelectItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setProgressToDelete(progress.id)
                          }}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your saved progress.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setProgressToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => {
                            if (progressToDelete) {
                              handleDeleteProgress(progressToDelete)
                              setProgressToDelete(null)
                            }
                          }}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              ) : (
                <SelectItem disabled value="no-progress">
                  No progress saved
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Button onClick={handleRestoreProgress} disabled={isRestoring || !selectedProgressId}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {isRestoring ? 'Restoring...' : 'Restore'}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isOverwrite ? "Overwrite Progress" : "Save Progress"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="progress-name" className="text-right">Name</Label>
                  <Input
                    id="progress-name"
                    value={progressName}
                    onChange={(e) => setProgressName(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                {/* Overwrite option */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Overwrite Existing</Label>
                  <Select
                    value={selectedOverwriteId || undefined}
                    onValueChange={(value) => {
                      setSelectedOverwriteId(value);
                      setIsOverwrite(value !== "new"); // Set overwrite flag only if it's not "new"
                    }}
                  >
                    <SelectTrigger className="col-span-3 w-full">
                      <SelectValue placeholder="Select Progress to Overwrite" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedProgressList?.length > 0 ? (
                        savedProgressList.map((progress) => (
                          <SelectItem key={progress.id} value={progress.id}>
                            {progress.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="no-progress">
                          No saved progress available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleSaveProgress}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : isOverwrite ? 'Overwrite' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
   
        {/*Step 1*/}
        <section className='flex border p-4 shadow-md rounded-lg flex-col w-full max-w-6xl'>
          <div className='w-full'>
            <h2 className="text-xl font-semibold">Step 1: Generate Script</h2>
            <Label className="text-gray-500">Select topic and duration of video to generate script in editor</Label>
          </div>
          <Accordion type="single" collapsible defaultValue="item-1" className='w-full'>
            <AccordionItem className='w-full' value="item-1">
              <AccordionTrigger><p className="font-semibold mt-0">Generate a Script with AI</p></AccordionTrigger>
              <AccordionContent className='max-w-6xl p-2 pb-4'>
                <div className="w-full">
                  <div className="w-full p-0 m-0">
                    <form onSubmit={handleSubmit} className='w-full'>
                      <div className='w-full'>
                        <div className="space-y-2">
                          <Label className="text-gray-500" htmlFor="prompt">Select a Topic</Label>
                          <div className="flex gap-2 flex-wrap">
                              {topics.map((topic) => (
                                <div
                                  key={topic.name}
                                  className={`border px-4 py-2 cursor-pointer rounded-lg flex items-center gap-2 text-sm transition-all ${
                                    selectedTopic === topic.name ? 'border-teal-500 bg-teal-100 text-teal-600' : 'border-gray-300'
                                  }`}
                                  onClick={() => handleSelect(topic.name)}
                                >
                                  <div>{topic.icon}</div>
                                  <p className=''>{topic.name}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                        {selectedTopic == 'Custom Topic' && 
                        <div className="space-y-2 mt-4">
                          <Label className="text-gray-500" htmlFor="prompt">Enter Topic Details</Label>
                          <Textarea
                            id="prompt"
                            placeholder="Describe the video you want to generate in detail..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full outline-transparent"
                          />
                        </div>}
                        {selectedTopic != 'Custom Topic' && 
                        <div className="space-y-2 mt-4">
                          <Label className="text-gray-500" htmlFor="prompt">Enter Topic Details</Label>
                          <Textarea
                            id="prompt"
                            placeholder="Describe the video you want to generate..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full outline-transparent"
                          />
                        </div>}
                        <div className="max-w-md w-full mt-4 space-y-2 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500">Target duration</span>
                            <span className="text-sm text-gray-500">{seconds} seconds (~{words} words)</span>
                          </div>
                          <Slider
                            min={10}
                            max={120}
                            step={1}
                            value={[seconds]}
                            onValueChange={(value) => setSeconds(value[0])}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">
                            This is an estimation, rendered video can be longer or shorter than this value.
                          </p>
                        </div>
                        <div className='flex flex-row items-center gap-2 mt-4'>
                        <Switch
                          id="gpt-model-toggle"
                          checked={model === 'gpt-4'}
                          onCheckedChange={handleToggle}
                        />
                        <Label htmlFor="gpt-model-toggle" className="text-sm text-gray-500">
                          Use very high quality script response (1 additional credit)
                        </Label>   
                        </div>
                      </div>
                      <footer className='mt-4'>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? <Loader className='animate-spin w-5 h-5' /> : 'Generate Script'}
                        </Button>
                      </footer>
                    </form>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>  
          <div className="mt-4 w-full">
            <header>
              <h2 className="text-sm font-semibold">Script Editor</h2>
            </header>
            <div>
              <div className="space-y-2 p-2 pt-0">
                <Label className='text-gray-500' htmlFor="script">Enter your own Script or Generate with AI</Label>
                <Textarea
                  id="script"
                  className="w-full h-52 p-2 border rounded"
                  rows={6}
                  value={generatedScript}
                  onChange={(e) => setGeneratedScript(e.target.value)}
                />
                <div className="text-sm">
                  <div className='flex justify-between'>
                    <p>Characters: {charCount}/1000</p>
                    <p className='font-bold'>Estimated credits: {credits}</p>
                  </div>
                  <p className="text-gray-600">Approximate duration of video: {videoDuration.toFixed(2)} seconds</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*Step 2*/}
        <section className='w-full border shadow-md  p-4 rounded-lg max-w-6xl'>
          <div className='w-full'>
            <h2 className="text-xl font-semibold">Step 2: Generate Audio from script or Upload your audio</h2>
            <Label className="text-gray-500">Based on audio - captions will be generated which can be modified</Label>
          </div>
          <div>
            <h2 className="text-sm font-semibold mt-2">Audio/Captions Generation</h2>
            <Tabs className='p-2' defaultValue="select-voice">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="select-voice">Select Voice</TabsTrigger>
                <TabsTrigger value="record-yourself">Record yourself</TabsTrigger>
              </TabsList>
              <TabsContent value="select-voice">
                <div className=''>    
                <Label className='text-gray-500' htmlFor="script">Enter your own Script or Generate with AI</Label>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
                  {voices.map((voice) => (
                    <div
                      key={voice.id}
                      className={`p-2 border rounded-lg cursor-pointer flex items-center ${
                        selectedVoice === voice.id ? 'border-teal-500 bg-teal-100 text-teal-600' : 'border-gray-300'
                      }`}
                      onClick={() => setSelectedVoice(voice.id)}
                    >
                      <Button
                        size="sm"
                        variant={"ghost"}
                        className="mr-2 hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleAudio(voice.id)
                        }}
                        
                      >
                        {playingAudio === voice.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <audio
                        ref={(el) => {
                          if (el) {
                            audioRefs.current[voice.id] = el
                          }
                        }}
                        src={voice.audioSrc}
                        onEnded={() => setPlayingAudio(null)}
                      />
                      <div>
                        <h3 className="font-semibold text-sm">{voice.name}</h3>
                        <p className="text-xs">{voice.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <footer className='p-0 pt-0'>
                  <Button onClick={handleSubmitScript} className="mt-0 w-full" disabled={isGeneratingAudio}>
                    {isGeneratingAudio ? <Loader className='animate-spin w-5 h-5' /> : 'Generate Audio & Timed Captions'}
                  </Button>
                </footer>
              </TabsContent>
              <TabsContent value="record-yourself">
                <div className="space-y-4">
                  <div>
                    <Label className='text-gray-500'>Upload a recording or record yourself. Your recording will be transcribed and the transcript will override the video text.</Label>
                  </div>
                  <div
                    {...getRootProps()}
                    className={`border-2 cursor-pointer border-dashed border-gray-300 rounded-lg p-8 text-start transition-all ${
                      isDragActive ? 'bg-teal-100' : 'bg-gray-100'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-center text-sm text-gray-600">
                      {isDragActive
                        ? 'Drop the file here...'
                        : 'Drag and drop an audio file here, or click to select a file'}
                    </p>
                    {selectedFile && (
                      <div className="mt-2 text-sm flex flex-col items-center justify-center text-gray-700">
                        <p>Selected: {selectedFile.name}</p>
                        <Button variant="outline" size="sm" onClick={handleRemoveFile} className="mt-2 flex items-center">
                          <X className="mr-2 h-4 w-4" /> Remove File
                        </Button>
                      </div>
                    )}
                  </div>
                  {selectedFile && (
                    <Button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? <Loader className="w-5 h-5 animate-spin" /> : 'Upload Audio'}
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>         
          </div>
                                  
        </section>
        
        {/*Step 2.1*/}
        <section className='w-full border shadow-md p-4 rounded-lg max-w-6xl'>
          <div className='w-full'>
            <h2 className="text-xl font-semibold">Step 2.1: Edit Captions</h2>
            <Label className="text-gray-500">Based on audio - captions generated can be revised and edited</Label>
          </div>
          {audioUrl && captions.length > 0 ? (
            <>
              <div className="overflow-x-hidden h-96 border rounded-lg mt-4 scrollbar-thin overflow-scroll p-4">
                <Accordion type="single" collapsible className="w-full mt-4">
                  {captions.map((caption, index) => (
                    <AccordionItem key={index} value={`caption-${index}`}>
                      <AccordionTrigger>
                        <h3 className="font-semibold">Caption {index + 1}</h3>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`start-${index}`}>Start Time (s)</Label>
                            <Input
                              id={`start-${index}`}
                              type="number"
                              value={caption.start}
                              onChange={(e) => handleCaptionChange(index, 'start', parseFloat(e.target.value))}
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`end-${index}`}>End Time (s)</Label>
                            <Input
                              id={`end-${index}`}
                              type="number"
                              value={caption.end}
                              onChange={(e) => handleCaptionChange(index, 'end', parseFloat(e.target.value))}
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`word-${index}`}>Word</Label>
                            <Input
                              id={`word-${index}`}
                              type="text"
                              value={caption.word}
                              onChange={(e) => handleCaptionChange(index, 'word', e.target.value.replace(/\s+/g, ''))}
                            />
                          </div>
                        </div>
                        <Button variant="destructive" onClick={() => handleDeleteCaption(index)} className="mt-2">
                          Delete Caption
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="mt-4 pl-2">
                <h3 className="font-semibold mb-2">Add New Caption</h3>
                <form onSubmit={handleAddCaption}>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="new-start">Start Time (s)</Label>
                      <Input
                        id="new-start"
                        type="number"
                        value={newCaption.start}
                        onChange={(e) => setNewCaption({ ...newCaption, start: e.target.value })}
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-end">End Time (s)</Label>
                      <Input
                        id="new-end"
                        type="number"
                        value={newCaption.end}
                        onChange={(e) => setNewCaption({ ...newCaption, end: e.target.value })}
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-word">Word</Label>
                      <Input
                        id="new-word"
                        type="text"
                        value={newCaption.word}
                        onChange={(e) => setNewCaption({ ...newCaption, word: e.target.value.replace(/\s+/g, '') })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="mt-2">
                    Add Caption
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-start text-sm text-gray-500 italic">
              No audio file uploaded
            </div>
          )}
        </section>

        {/*Step 3*/}
        <section className='w-full border shadow-md  p-4 rounded-lg max-w-6xl'>
          <div className='w-full'>
            <h2 className="text-xl font-semibold">Step 3: Primary materials to modify</h2>
            <Label className="text-gray-500">Realtime changes will be reflected in the video preview</Label>
          </div>
          <div className='p-0 pt-0'>
            <div className=''>
              {audioUrl && captions.length > 0 ? (
                <>
                  <CaptionHighlighting 
                    audioUrl={audioUrl} 
                    captions={captions} 
                    onGroupedCaptionsUpdate={handleGroupedCaptionsUpdate} 
                    onFramesUpdate={handleFramesUpdate}
                    onBgmusicUpdate={handleBgmusicUpdate}
                    onBackgroundUpdateBg={handleBackgroundsUpdate} 
                    onHighlightUpdate={handleHighlightUpdate}
                  />
                  <div className='p-2 pt-0 mt-4'>
                  <Label className='text-gray-500'>Download/Copy SRT/JSON Files of captions</Label>        
                  <Tabs defaultValue="srt" className='mt-1'>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="srt">SRT</TabsTrigger>
                      <TabsTrigger value="json">JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="srt">
                      <div className="flex justify-between items-center mt-4 mb-4">
                        <Button onClick={() => handleCopy(captionsToSRT(groupedCaptions))} variant="outline" size="sm" className="flex items-center gap-2">
                          <ClipboardCopy className="h-4 w-4" /> Copy SRT
                        </Button>
                        <Button onClick={() => handleDownload(captionsToSRT(groupedCaptions), 'captions.srt')} variant="outline" size="sm" className="flex items-center gap-2">
                          <Download className="h-4 w-4" /> Download SRT
                        </Button>
                      </div>
                      <pre className="overflow-x-hidden h-96 border rounded-lg mt-4 scrollbar-thin overflow-scroll p-4">
                        {captionsToSRT(groupedCaptions)}
                      </pre>
                    </TabsContent>
                    <TabsContent value="json">
                      <div className="flex justify-between items-center mt-4 mb-4">
                        <Button onClick={() => handleCopy(JSON.stringify(groupedCaptions, null, 2))} variant="outline" size="sm" className="flex items-center gap-2">
                          <ClipboardCopy className="h-4 w-4" /> Copy JSON
                        </Button>
                        <Button onClick={() => handleDownload(JSON.stringify(groupedCaptions, null, 2), 'captions.json')} variant="outline" size="sm" className="flex items-center gap-2">
                          <Download className="h-4 w-4" /> Download JSON
                        </Button>
                      </div>
                      <pre className="overflow-x-hidden h-96 border rounded-lg mt-4 scrollbar-thin overflow-scroll p-4">
                        {JSON.stringify(groupedCaptions, null, 2)}
                      </pre>
                    </TabsContent>
                  </Tabs>
                  </div>
                </>
              ) : (
                <div className="text-start text-sm text-gray-500 italic">
                  No audio file uploaded
                </div>
              )}
            </div>
          </div> 
            
        </section>

        {/*Step 4*/}
        <section className="w-full border shadow-md p-4 rounded-lg max-w-6xl">
          <div className="w-full">
            <h2 className="text-xl font-semibold">Step 4: Secondary materials to modify</h2>
            <Label className="text-gray-500">Realtime changes will be reflected in the video preview</Label>
          </div>

          <div className='p-2 pt-0 space-y-2'>
            <div className="">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="frame-templates">
                  <AccordionTrigger>
                    <h2 className="text-sm font-semibold mt-0">Select Frame Template</h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    {frames.length <= 0 ? (
                      <div className="text-start text-gray-500 italic">
                        No frames available
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-2">
                        {uniqueStartTimes.map((startTime) => (
                          <div key={startTime} className="space-y-1">
                            <Label className="font-medium">Frame Start Time: {startTime}</Label>
                            <Select
                              value={frameTemplateMap[startTime] || ''}
                              onValueChange={(value) => handleTemplateSelect(startTime, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a template" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Fullscreen">Fullscreen</SelectItem>
                                <SelectItem value="Boxed">Boxed</SelectItem>
                                <SelectItem value="Boxed2">Boxed2</SelectItem>
                                <SelectItem value="Boxed3">Boxed3</SelectItem>
                                <SelectItem value="BoxedN">BoxedN</SelectItem>
                              </SelectContent>
                            </Select>
                            {frameTemplateMap[startTime] === 'BoxedN' && (
                              <Input
                                type="number"
                                placeholder="Enter N for BoxedN"
                                onChange={(e) => handleTemplateSelect(startTime, `Boxed${e.target.value}`)}
                              />
                            )}
                            <div className="space-y-2 mt-2">
                              <Label>Style Configuration</Label>
                              {Object.entries(frameStyles[startTime] || {}).map(([key, value]) => (
                                <div key={key} className="flex items-center space-x-2">
                                  <Label>{key}</Label>
                                  <Input
                                    value={value}
                                    onChange={(e) => handleFrameStyleChange(startTime, key as keyof FrameStyle, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-semibold">Select Primary Text Placements</AccordionTrigger>
                  <AccordionContent>
                    {textSegments.length === 0 ? (
                      <div className="text-start text-gray-500 italic"></div>
                    ) : (
                      <>
                        <div>
                          <Accordion type="single" collapsible className="w-full">
                            {textSegments.map((segment, index) => (
                              <AccordionItem key={segment.id} value={`segment-${segment.id}`}>
                                <AccordionTrigger>
                                  <h3 className="font-semibold">Segment {index + 1}</h3>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                      <Label htmlFor={`start-${segment.id}`}>Start Time (s)</Label>
                                      <Input
                                        id={`start-${segment.id}`}
                                        type="number"
                                        value={segment.start}
                                        onChange={(e) =>
                                          updateSegment(segment.id, 'start', parseFloat(e.target.value))
                                        }
                                        step="0.01"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`duration-${segment.id}`}>Duration (s)</Label>
                                      <Input
                                        id={`duration-${segment.id}`}
                                        type="number"
                                        value={segment.duration}
                                        onChange={(e) => {
                                          const duration = parseFloat(e.target.value);
                                          updateSegment(segment.id, 'duration', duration);
                                          updateSegment(segment.id, 'end', segment.start + duration);
                                        }}
                                        step="0.01"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`end-${segment.id}`}>End Time (s)</Label>
                                      <Input
                                        id={`end-${segment.id}`}
                                        type="number"
                                        value={segment.end}
                                        onChange={(e) => {
                                          const end = parseFloat(e.target.value);
                                          updateSegment(segment.id, 'end', end);
                                          updateSegment(segment.id, 'duration', end - segment.start);
                                        }}
                                        step="0.01"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`stack-${segment.id}`}>Stack</Label>
                                      <Input
                                        id={`stack-${segment.id}`}
                                        type="number"
                                        value={segment.style.stack}
                                        onChange={(e) =>
                                          updateSegmentStyle(segment.id, 'stack', parseInt(e.target.value))
                                        }
                                        min={1}
                                      />
                                    </div>
                                    <div className="mb-4">
                                      <Label htmlFor={`place-${segment.id}`}>Place</Label>
                                      <Select
                                        value={segment.style.place} // Accessing place from the segment style
                                        onValueChange={(value) => updateSegmentStyle(segment.id, 'place', value)}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select a place" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="center">Center</SelectItem>
                                          <SelectItem value="left">Left</SelectItem>
                                          <SelectItem value="right">Right</SelectItem>
                                          <SelectItem value="top">Top</SelectItem>
                                          <SelectItem value="bottom">Bottom</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Font Family Picker */}
                                  <FontFamilyPicker
                                    currentFont={segment.style.fontFamily}
                                    handleAttributeChange={(attribute, value) =>
                                      updateSegmentStyle(segment.id, 'fontFamily', value)
                                    }
                                    attribute="fontFamily"
                                  />

                                  {/* Color Picker */}
                                  <ColorPicker
                                    attribute="color"
                                    label="Text Color"
                                    currentColor={segment.style.color}
                                    handleAttributeChange={(attribute, value) =>
                                      updateSegmentStyle(segment.id, 'color', value)
                                    }
                                  />

                                  {/* X and Y position sliders */}
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <Label htmlFor={`x-position-${segment.id}`}>X Position</Label>
                                      <Slider
                                        id={`x-position-${segment.id}`}
                                        value={[parseFloat(segment.style.left)]}
                                        onValueChange={(value) =>
                                          updateSegmentStyle(segment.id, 'left', `${value[0]}%`)
                                        }
                                        min={-100}
                                        max={100}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`y-position-${segment.id}`}>Y Position</Label>
                                      <Slider
                                        id={`y-position-${segment.id}`}
                                        value={[parseFloat(segment.style.top)]}
                                        onValueChange={(value) =>
                                          updateSegmentStyle(segment.id, 'top', `${value[0]}%`)
                                        }
                                        min={-100}
                                        max={100}
                                      />
                                    </div>
                                  </div>

                                  {/* Text Size, Font Weight, Opacity, and Rotation Sliders */}
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <Label htmlFor={`text-size-${segment.id}`}>Font Size : {segment.style.fontSize}</Label>
                                      <Slider
                                        id={`text-size-${segment.id}`}
                                        value={[parseFloat(segment.style.fontSize)]}
                                        onValueChange={(value) =>
                                          updateSegmentStyle(segment.id, 'fontSize', `${value[0]}rem`)
                                        }
                                        min={0}
                                        step={0.1}
                                        max={100}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`font-weight-${segment.id}`}>Font Weight</Label>
                                      <Slider
                                        id={`font-weight-${segment.id}`}
                                        value={[segment.style.fontWeight]}
                                        onValueChange={(value) =>
                                          updateSegmentStyle(segment.id, 'fontWeight', value[0])
                                        }
                                        min={100}
                                        max={900}
                                        step={100}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`opacity-${segment.id}`}>Opacity</Label>
                                      <Slider
                                        id={`opacity-${segment.id}`}
                                        value={[segment.style.opacity * 100]}
                                        onValueChange={(value) =>
                                          updateSegmentStyle(segment.id, 'opacity', value[0] / 100)
                                        }
                                        min={0}
                                        max={100}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`rotation-${segment.id}`}>Rotation (degrees)</Label>
                                      <Slider
                                        id={`rotation-${segment.id}`}
                                        value={[
                                          parseFloat(
                                            segment.style.transform.replace('rotate(', '').replace('deg)', '')
                                          ),
                                        ]}
                                        onValueChange={(value) =>
                                          updateSegmentStyle(segment.id, 'transform', `rotate(${value[0]}deg)`)
                                        }
                                        min={-180}
                                        max={180}
                                      />
                                    </div>
                                  </div>

                                  {/* Line Height, Width, Height, Stack */}
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <Label htmlFor={`line-height-${segment.id}`}>Line Height</Label>
                                      <Input
                                        id={`line-height-${segment.id}`}
                                        type="text"
                                        value={segment.style.lineHeight}
                                        onChange={(e) =>
                                          updateSegmentStyle(segment.id, 'lineHeight', e.target.value)
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`width-${segment.id}`}>Width</Label>
                                      <Input
                                        id={`width-${segment.id}`}
                                        type="text"
                                        value={segment.style.width}
                                        onChange={(e) =>
                                          updateSegmentStyle(segment.id, 'width', e.target.value)
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`height-${segment.id}`}>Height</Label>
                                      <Input
                                        id={`height-${segment.id}`}
                                        type="text"
                                        value={segment.style.height}
                                        onChange={(e) =>
                                          updateSegmentStyle(segment.id, 'height', e.target.value)
                                        }
                                      />
                                    </div>                           
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor={`padding-between-lines-${segment.id}`}>Padding Between Lines (rem)</Label>
                                      <Input
                                        id={`padding-between-lines-${segment.id}`}
                                        type="number"
                                        value={paddingBetweenLines}
                                        onChange={(e) => setPaddingBetweenLines(parseInt(e.target.value))}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`padding-from-frame-${segment.id}`}>Padding From Frame (rem)</Label>
                                      <Input
                                        id={`padding-from-frame-${segment.id}`}
                                        type="number"
                                        value={paddingFromFrame}
                                        onChange={(e) => setPaddingFromFrame(parseInt(e.target.value))}
                                      />
                                    </div>
                                  </div>

                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      setTextSegments((prev) =>
                                        prev.filter((segment) => segment.id !== segment.id)
                                      )
                                    }
                                  >
                                    Delete Segment
                                  </Button>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </>
                    )}

                    {groupedCaptions.length === 0 ? (
                      <div className="text-start text-gray-500 italic">No captions available</div>
                    ) : (
                      <div className="mt-4 p-4 border-t">
                        <h3 className="font-semibold mb-2">Add New Segment</h3>
                        <form onSubmit={handleAddSegment}>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="new-start">Start Time (s)</Label>
                              <Input
                                id="new-start"
                                type="number"
                                value={newSegment.start}
                                min={0}
                                onChange={(e) =>
                                  setNewSegment((prev) => ({ ...prev, start: parseFloat(e.target.value) }))
                                }
                                step="0.01"
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-duration">Duration (s)</Label>
                              <Input
                                id="new-duration"
                                type="number"
                                value={newSegment.duration}
                                min={0}
                                onChange={(e) =>
                                  setNewSegment((prev) => ({
                                    ...prev,
                                    duration: parseFloat(e.target.value),
                                    end: newSegment.start + parseFloat(e.target.value),
                                  }))
                                }
                                step="0.01"
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-end">End Time (s)</Label>
                              <Input
                                id="new-end"
                                type="number"
                                value={newSegment.end}
                                min={0}
                                onChange={(e) =>
                                  setNewSegment((prev) => ({
                                    ...prev,
                                    end: parseFloat(e.target.value),
                                    duration: parseFloat(e.target.value) - newSegment.start,
                                  }))
                                }
                                step="0.01"
                              />
                            </div>
                          </div>

                          {/* Line Height, Width, Height, Stack */}
                          

                          <FontFamilyPicker
                            currentFont={newSegment.style.fontFamily}
                            handleAttributeChange={(attribute, value) =>
                              setNewSegment((prev) => ({
                                ...prev,
                                style: { ...prev.style, fontFamily: value },
                              }))
                            }
                            attribute="fontFamily"
                          />

                          <ColorPicker
                            attribute="color"
                            label="Text Color"
                            currentColor={newSegment.style.color}
                            handleAttributeChange={(attribute, value) =>
                              setNewSegment((prev) => ({ ...prev, style: { ...prev.style, color: value } }))
                            }
                          />

                          <Button type="submit" className="mt-4">
                            Add Segment
                          </Button>
                        </form>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="secondary-text">
                  <AccordionTrigger className="font-semibold">Secondary Text Placement</AccordionTrigger>
                  <AccordionContent>
                  {audioUrl ? (
                    <div>
                      {secondaryTextSegmentsSec.map((segment, index) => (
                      <Accordion key={segment.id} type="single" collapsible className="w-full mb-4">
                        <AccordionItem value={`segment-${segment.id}`}>
                          <AccordionTrigger>
                            <h3 className="font-semibold">Secondary Text {index + 1}</h3>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 gap-4 mb-4">
                              <div>
                                <Label htmlFor={`text-${segment.id}`}>Text</Label>
                                <Input
                                  id={`text-${segment.id}`}
                                  value={segment.text}
                                  onChange={(e) => updateSegmentSec(segment.id, 'text', e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor={`start-${segment.id}`}>Start Time (s)</Label>
                                  <Input
                                    id={`start-${segment.id}`}
                                    type="number"
                                    value={segment.start}
                                    onChange={(e) => updateSegmentSec(segment.id, 'start', parseFloat(e.target.value))}
                                    step="0.01"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`duration-${segment.id}`}>Duration (s)</Label>
                                  <Input
                                    id={`duration-${segment.id}`}
                                    type="number"
                                    value={segment.duration}
                                    onChange={(e) => {
                                      const duration = parseFloat(e.target.value);
                                      updateSegmentSec(segment.id, 'duration', duration);
                                      updateSegmentSec(segment.id, 'end', segment.start + duration);
                                    }}
                                    step="0.01"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`end-${segment.id}`}>End Time (s)</Label>
                                  <Input
                                    id={`end-${segment.id}`}
                                    type="number"
                                    value={segment.end}
                                    onChange={(e) => {
                                      const end = parseFloat(e.target.value);
                                      updateSegmentSec(segment.id, 'end', end);
                                      updateSegmentSec(segment.id, 'duration', end - segment.start);
                                    }}
                                    step="0.01"
                                  />
                                </div>
                              </div>
                            </div>

                            <FontFamilyPickerSec
                              currentFont={segment.style.fontFamily}
                              handleAttributeChangeSec={(attribute, value) => updateSegmentStyleSec(segment.id, 'fontFamily', value)}
                              attribute="fontFamily"
                            />

                            <ColorPickerSec
                              attribute="color"
                              label="Text Color"
                              currentColor={segment.style.color}
                              handleAttributeChangeSec={(attribute, value) => updateSegmentStyleSec(segment.id, 'color', value)}
                            />

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label htmlFor={`x-position-${segment.id}`}>X Position</Label>
                                <Slider
                                  id={`x-position-${segment.id}`}
                                  value={[parseFloat(segment.style.left)]}
                                  onValueChange={(value) => updateSegmentStyleSec(segment.id, 'left', `${value[0]}%`)}
                                  min={-100}
                                  max={100}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`y-position-${segment.id}`}>Y Position</Label>
                                <Slider
                                  id={`y-position-${segment.id}`}
                                  value={[parseFloat(segment.style.top)]}
                                  onValueChange={(value) => updateSegmentStyleSec(segment.id, 'top', `${value[0]}%`)}
                                  min={-100}
                                  max={100}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label htmlFor={`text-size-${segment.id}`}>Font Size : {segment.style.fontSize}</Label>
                                <Slider
                                  id={`text-size-${segment.id}`}
                                  value={[parseFloat(segment.style.fontSize)]}
                                  onValueChange={(value) => updateSegmentStyleSec(segment.id, 'fontSize', `${value[0]}rem`)}
                                  min={0}
                                  step={0.1}
                                  max={100}
                                />
                              </div>
                              <div>
                              <Label htmlFor={`font-weight-${segment.id}`}>Font Weight</Label>
                              <Slider
                                id={`font-weight-${segment.id}`}
                                value={[segment.style.fontWeight]}
                                onValueChange={(value) => updateSegmentStyleSec(segment.id, 'fontWeight', value[0])}
                                min={100}
                                max={900}
                                step={100}
                              />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label htmlFor={`opacity-${segment.id}`}>Opacity</Label>
                                <Slider
                                  id={`opacity-${segment.id}`}
                                  value={[segment.style.opacity * 100]}
                                  onValueChange={(value) => updateSegmentStyleSec(segment.id, 'opacity', value[0] / 100)}
                                  min={0}
                                  max={100}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`rotation-${segment.id}`}>Rotation (degrees)</Label>
                                <Slider
                                  id={`rotation-${segment.id}`}
                                  value={[parseFloat(segment.style.transform.replace('rotate(', '').replace('deg)', ''))]
                                  }
                                  onValueChange={(value) => updateSegmentStyleSec(segment.id, 'transform', `rotate(${value[0]}deg)`)}
                                  min={-180}
                                  max={180}
                                />
                              </div>
                            </div>

                            <Button variant="destructive" onClick={() => handleDeleteSegmentSec(segment.id)}>
                              Delete Segment
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                      <form onSubmit={handleAddSegmentSec} className="mt-4">
  <h3 className="font-semibold mb-2">Add New Secondary Text</h3>
  <div className="grid grid-cols-1 gap-4 mb-4">
    <div>
      <Label htmlFor="new-text">Text</Label>
      <Input
        id="new-text"
        value={newSegmentSec.text}
        onChange={(e) => setNewSegmentSec((prev) => ({ ...prev, text: e.target.value }))}
      />
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="new-start">Start Time (s)</Label>
        <Input
          id="new-start"
          type="number"
          value={newSegmentSec.start}
          onChange={(e) => setNewSegmentSec((prev) => ({ ...prev, start: parseFloat(e.target.value) }))}
          step="0.01"
        />
      </div>
      <div>
        <Label htmlFor="new-duration">Duration (s)</Label>
        <Input
          id="new-duration"
          type="number"
          value={newSegmentSec.duration}
          onChange={(e) =>
            setNewSegmentSec((prev) => ({
              ...prev,
              duration: parseFloat(e.target.value),
              end: prev.start + parseFloat(e.target.value),
            }))
          }
          step="0.01"
        />
      </div>
      <div>
        <Label htmlFor="new-end">End Time (s)</Label>
        <Input
          id="new-end"
          type="number"
          value={newSegmentSec.end}
          onChange={(e) =>
            setNewSegmentSec((prev) => ({
              ...prev,
              end: parseFloat(e.target.value),
              duration: parseFloat(e.target.value) - prev.start,
            }))
          }
          step="0.01"
        />
      </div>
    </div>

    {/* Font Family Picker */}
    <FontFamilyPickerSec
      currentFont={newSegmentSec.style.fontFamily}
      handleAttributeChangeSec={(attribute, value) =>
        setNewSegmentSec((prev) => ({
          ...prev,
          style: { ...prev.style, [attribute]: value },
        }))
      }
      attribute="fontFamily"
    />

    {/* Color Picker */}
    <ColorPickerSec
      attribute="color"
      label="Text Color"
      currentColor={newSegmentSec.style.color}
      handleAttributeChangeSec={(attribute, value) =>
        setNewSegmentSec((prev) => ({
          ...prev,
          style: { ...prev.style, [attribute]: value },
        }))
      }
    />
  </div>

  <Button type="submit">Add Secondary Text</Button>
                      </form>
                    </div>
                    ):(
                      <div className="text-start text-sm text-gray-500 italic">No audio file uploaded</div>
                    )}
                  </AccordionContent>        
                  
                </AccordionItem>
              </Accordion>
            </div>
          </div>  
          
          <div className='p-2 pt-0 pb-0 space-y-0'>
            <div className="mb-2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="transition-videos">
                  <AccordionTrigger>
                    <h2 className="text-sm font-semibold mt-0">Select Transition Videos</h2>
                  </AccordionTrigger>
                  <AccordionContent className='mt-0'>
                    {frames.length > 0 ? (
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload Transitions</TabsTrigger>
                        <TabsTrigger value="assign">Assign Transitions</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload">
                        <div
                          {...getTransitionRootProps()}
                          className="border-2 cursor-pointer border-dashed border-gray-300 rounded-lg p-8 text-start transition-all bg-gray-50"
                        >
                          <input {...getTransitionInputProps()} className="hidden" />
                          <div className="flex flex-col items-center justify-center">
                            <FileVideo className="h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              Drag and drop transition videos here, or click to select files
                            </p>
                          </div>
                        </div>
                        {transitionVideos.length > 0 && (
                          <div className="mt-4">
                            <h3 className="font-semibold mb-2">Selected Transition Videos:</h3>
                            {transitionVideos.map((video, index) => (
                              <div key={index} className="flex items-center justify-between mb-2">
                                <span>{video.name}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveTransitionVideo(index)}
                                  className="flex items-center"
                                >
                                  <X className="mr-2 h-4 w-4" /> Remove
                                </Button>
                              </div>
                            ))}
                            <Button onClick={handleTransitionVideoSubmit} className="w-full bg-black text-white mt-4">
                              Upload Transition Videos
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="assign">
                        <div className="space-y-4">
                          <h3 className="font-semibold">Assign Transitions to Frames</h3>
                          {uniqueStartTimes.map((startTime, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <span>Frame starting at {startTime}s</span>
                              <Select
                                value={selectedTransitions[index] || 'no-transition'}
                                onValueChange={(value) => handleTransitionSelect(index, value)}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Select transition" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="no-transition">No Transition</SelectItem>
                                  {transitionVideoUrl.map((url, i) => (
                                    <SelectItem key={i} value={url}>
                                      Transition {i + 1}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {selectedTransitions[index] && selectedTransitions[index] !== 'no-transition' && (
                                <div className="flex items-center space-x-2">
                                  <Label>Volume</Label>
                                  <Slider
                                    value={[transitionVolume[transitionVideoUrl.indexOf(selectedTransitions[index])] || 100]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => handleVolumeChange(index, value[0])}
                                    className="w-[100px]"
                                  />
                                  <span>{transitionVolume[transitionVideoUrl.indexOf(selectedTransitions[index])] || 100}%</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>) : (<div className="text-start text-gray-500 italic">
                        No frames available
                      </div>)}
                    
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div className='p-2 pt-0 pb-0 space-y-0'>
            <BackgroundColorPicker
              currentColor={backgroundColor}
              handleBackgroundColorChange={handleBackgroundColorChange}
              audioUrl={audioUrl || ""}
            />
          </div>
        </section>
      </div>
      {isLargeScreen ? (
        <Draggable
        handle=".draggable-handle"
        bounds={bounds}
        position={draggablePosition}
        onDrag={handleDrag}
        defaultPosition={{ x: 0, y: 0 }}
        >
          <div 
            className="p-4 pt-2 bg-secondary shadow-md fixed z-10 rounded-lg border"
            style={{
              bottom: '10px',
              right: '10px',
              maxHeight: 'calc(100vh - 40px)',
              maxWidth: 'calc(100vw - 48px)',
              width: '400px', 
              overflowY: 'auto'
            }}
          >
            <div className="draggable-handle cursor-move flex justify-center flex-col items-center gap-2">
              <GripHorizontal />
              <Separator/>
            </div>
        
            <div className="p-4">
              <RemotionComponent1/>
            </div>

            <div className="draggable-handle cursor-move flex justify-center flex-col items-center gap-2">
              <Separator/>
              <GripHorizontal />
            </div>
          </div>
        </Draggable>
      ) : (
        <div className="bg-secondary bg-white dark:bg-black shadow-md rounded-lg border p-4 max-w-6xl mb-4 mx-4 mt-2">
          <RemotionComponent1/>
        </div>
      )}
      
    </main>
  )
}