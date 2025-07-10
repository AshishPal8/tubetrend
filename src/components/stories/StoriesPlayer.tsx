"use client";
import { StoryType } from "@/generated/prisma";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface Story {
  id: number;
  mediaUrl: string;
  type: StoryType;
  caption?: string | null;
  duration: number;
}

interface Props {
  title: string;
  thumbnail: string;
  stories: Story[];
  onNextStorySet?: () => void;
  onPrevStorySet?: () => void;
  hasNextStorySet?: boolean;
  hasPrevStorySet?: boolean;
}

const StoriesPlayer = ({
  title,
  thumbnail,
  stories,
  onNextStorySet,
  onPrevStorySet,
  hasNextStorySet = false,
  hasPrevStorySet = false,
}: Props) => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartRef = useRef<number>(0);

  const story = stories[current];

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getStoryDuration = useCallback((story: Story) => {
    if (story.type === "VIDEO" && videoRef.current?.duration) {
      return videoRef.current.duration * 1000;
    }
    return story.duration * 1000;
  }, []);

  const startStoryTimer = useCallback(() => {
    if (!story || !isPlaying) return;

    const duration = getStoryDuration(story);
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, duration - elapsed);

    setProgress((elapsed / duration) * 100);

    if (remaining <= 0) {
      // Story finished, move to next
      if (current < stories.length - 1) {
        setCurrent((prev) => prev + 1);
      } else if (hasNextStorySet && onNextStorySet) {
        onNextStorySet();
      }
      return;
    }

    timeoutRef.current = setTimeout(() => {
      if (current < stories.length - 1) {
        setCurrent((prev) => prev + 1);
      } else if (hasNextStorySet && onNextStorySet) {
        onNextStorySet();
      }
    }, remaining);

    // Update progress every 50ms
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 100);
      setProgress(progressPercent);
    }, 50);
  }, [
    story,
    isPlaying,
    startTime,
    current,
    stories.length,
    hasNextStorySet,
    onNextStorySet,
    getStoryDuration,
  ]);

  // Reset story
  const resetStory = useCallback(() => {
    setProgress(0);
    setStartTime(Date.now());
    clearTimers();
  }, [clearTimers]);

  // Navigate to next story
  const nextStory = useCallback(() => {
    if (current < stories.length - 1) {
      setCurrent((prev) => prev + 1);
    } else if (hasNextStorySet && onNextStorySet) {
      onNextStorySet();
    }
  }, [current, stories.length, hasNextStorySet, onNextStorySet]);

  // Navigate to previous story
  const prevStory = useCallback(() => {
    if (current > 0) {
      setCurrent((prev) => prev - 1);
    } else if (hasPrevStorySet && onPrevStorySet) {
      onPrevStorySet();
    }
  }, [current, hasPrevStorySet, onPrevStorySet]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  // Handle touch events for navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextStory();
      } else {
        prevStory();
      }
    }
  };

  const handleScreenClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 2) {
      prevStory();
    } else {
      nextStory();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          prevStory();
          break;
        case "ArrowRight":
          nextStory();
          break;
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "m":
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevStory, nextStory, togglePlayPause, toggleMute]);

  // Reset and start timer when story changes
  useEffect(() => {
    resetStory();
  }, [current, resetStory]);

  // Start timer when playing state changes
  useEffect(() => {
    if (isPlaying) {
      startStoryTimer();
    } else {
      clearTimers();
    }

    return () => clearTimers();
  }, [isPlaying, startStoryTimer, clearTimers]);

  // Handle video events
  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play();
      }
    }
  };

  if (!story) return null;

  return (
    <div className="w-[360px] h-[640px] bg-neutral-900 rounded-xl overflow-hidden relative shadow-lg select-none">
      <div
        className="relative w-full h-full cursor-pointer"
        onClick={handleScreenClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {story.type === "IMAGE" && (
          <Image
            src={story.mediaUrl}
            alt={story.caption || "story"}
            fill
            className="object-cover"
            priority
          />
        )}

        {story.type === "VIDEO" && (
          <video
            ref={videoRef}
            src={story.mediaUrl}
            className="w-full h-full object-cover"
            muted={isMuted}
            onLoadedData={handleVideoLoad}
            onEnded={nextStory}
            playsInline
          />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            prevStory();
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          disabled={current === 0 && !hasPrevStorySet}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextStory();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          disabled={current === stories.length - 1 && !hasNextStorySet}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* progress */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {stories.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded bg-white/30 overflow-hidden"
          >
            <div
              className={`h-full bg-white transition-all duration-100 ${
                i === current
                  ? "transition-none"
                  : i < current
                  ? "w-full"
                  : "w-0"
              }`}
              style={{
                width:
                  i === current ? `${progress}%` : i < current ? "100%" : "0%",
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 pt-2 z-10">
        <div className="flex items-center gap-3">
          <Image
            src={thumbnail}
            alt={title}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="text-white text-sm font-medium">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="p-1 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {story.type === "VIDEO" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="p-1 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
        </div>
      </div>

      {story.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4 text-sm">
          {story.caption}
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
        {current + 1} / {stories.length}
      </div>
    </div>
  );
};

export default StoriesPlayer;
