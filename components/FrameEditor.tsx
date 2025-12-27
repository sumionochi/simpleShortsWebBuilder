// components/FrameEditor.tsx
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Play, Pause } from 'lucide-react';
import { toast } from "sonner";

interface Frame {
  start: number;
  end: number;
  imageUrl: string;
  duration: number;
}

interface FrameEditorProps {
  frames: Frame[];
  setFrames: React.Dispatch<React.SetStateAction<Frame[]>>;
}

const FrameEditor: React.FC<FrameEditorProps> = ({ frames, setFrames }) => {
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);
  const [tempStart, setTempStart] = useState<number>(0);
  const [tempEnd, setTempEnd] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const audioRefs = React.useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const startEditing = (index: number) => {
    setEditingFrameIndex(index);
    setTempStart(frames[index].start);
    setTempEnd(frames[index].end);
  };

  const saveEditing = (index: number) => {
    if (tempStart >= tempEnd) {
      toast("Invalid Timing", { description: "Start time must be less than end time." });
      return;
    }

    // Check for overlapping frames
    for (let i = 0; i < frames.length; i++) {
      if (i !== index) {
        const frame = frames[i];
        if (
          (tempStart >= frame.start && tempStart < frame.end) ||
          (tempEnd > frame.start && tempEnd <= frame.end) ||
          (tempStart <= frame.start && tempEnd >= frame.end)
        ) {
          toast("Overlap Detected", { description: `Frame ${i + 1} overlaps with the edited frame.` });
          return;
        }
      }
    }

    const updatedFrames = [...frames];
    updatedFrames[index] = {
      ...updatedFrames[index],
      start: tempStart,
      end: tempEnd,
      duration: tempEnd - tempStart,
    };
    setFrames(updatedFrames);
    setEditingFrameIndex(null);
    toast("Frame Updated", { description: `Frame ${index + 1} timings updated.` });
  };

  const cancelEditing = () => {
    setEditingFrameIndex(null);
  };

  const deleteFrame = (index: number) => {
    const updatedFrames = frames.filter((_, i) => i !== index);
    setFrames(updatedFrames);
    toast("Frame Deleted", { description: `Frame ${index + 1} has been removed.` });
  };

  const togglePlay = (index: number) => {
    const audio = audioRefs.current[`frame-${index}`];
    if (audio) {
      if (isPlaying === `frame-${index}`) {
        audio.pause();
        setIsPlaying(null);
      } else {
        if (isPlaying) {
          audioRefs.current[isPlaying]?.pause();
        }
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(`frame-${index}`);
      }

      audio.onended = () => {
        setIsPlaying(null);
      };
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Edit Frame Timings</h3>
      {frames.length === 0 && <p>No frames available to edit.</p>}
      {frames.map((frame, index) => (
        <div key={index} className="flex items-center space-x-4 mb-2 p-2 border rounded">
          <div className="flex-1">
            {editingFrameIndex === index ? (
              <div className="flex space-x-2">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={tempStart}
                  onChange={(e) => setTempStart(parseFloat(e.target.value))}
                  placeholder="Start (s)"
                />
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(parseFloat(e.target.value))}
                  placeholder="End (s)"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => togglePlay(index)}
                  className="p-1"
                  aria-label={isPlaying === `frame-${index}` ? "Pause" : "Play"}
                >
                  {isPlaying === `frame-${index}` ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <audio
                  ref={(el) => {
                    if (el) {
                      audioRefs.current[`frame-${index}`] = el;
                    }
                  }}
                  src={frame.imageUrl} // Assuming imageUrl points to an audio file; adjust if different
                />
                <p>
                  <strong>Frame {index + 1}:</strong> {frame.start.toFixed(1)}s - {frame.end.toFixed(1)}s
                </p>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {editingFrameIndex === index ? (
              <>
                <Button size="sm" onClick={() => saveEditing(index)}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={() => startEditing(index)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteFrame(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FrameEditor;
