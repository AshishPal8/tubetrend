"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

type StoryType = "IMAGE" | "VIDEO";

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

  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartRef = useRef<number>(0);

  const story = stories[current];

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // compute duration in ms. For video, prefer actual video duration when available.
  const getStoryDurationMs = useCallback((s: Story) => {
    if (
      s.type === "VIDEO" &&
      videoRef.current?.duration &&
      !isNaN(videoRef.current.duration)
    ) {
      return Math.max(100, Math.floor(videoRef.current.duration * 1000));
    }
    return Math.max(100, Math.floor((s.duration || 3) * 1000)); // fallback: provided duration in seconds or 3s
  }, []);

  // Start timers for the current story. Uses a local `start` to avoid stale state races.
  const startStoryTimer = useCallback(() => {
    clearTimers();
    if (!story || !isPlaying) return;

    // For video: if duration not available yet, do not start timer here.
    if (story.type === "VIDEO") {
      const videoDuration = videoRef.current?.duration;
      if (!videoDuration || isNaN(videoDuration)) {
        // Wait for loadedmetadata to trigger start (handled in onLoadedMetadata below)
        setProgress(0);
        return;
      }
    }

    const durationMs = getStoryDurationMs(story);
    const start = Date.now();
    setProgress(0);

    // timeout for advancing the story after remaining ms
    timeoutRef.current = window.setTimeout(() => {
      clearTimers();
      // move next
      if (current < stories.length - 1) {
        setCurrent((c) => c + 1);
      } else if (hasNextStorySet && onNextStorySet) {
        onNextStorySet();
      }
    }, durationMs);

    // interval to update progress
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);
    }, 50);
  }, [
    story,
    isPlaying,
    clearTimers,
    current,
    stories.length,
    hasNextStorySet,
    onNextStorySet,
    getStoryDurationMs,
  ]);

  // reset and start when story changes
  useEffect(() => {
    clearTimers();
    setProgress(0);

    // If story is VIDEO and video element exists and is already loaded, start immediately
    if (story?.type === "VIDEO") {
      const v = videoRef.current;
      if (v && v.duration && !isNaN(v.duration)) {
        // small tick to allow UI update
        setTimeout(() => startStoryTimer(), 50);
      } else {
        // wait for onLoadedMetadata to call startStoryTimer
      }
    } else {
      // images (or video fallback), start timer
      setTimeout(() => startStoryTimer(), 50);
    }

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, story?.type, startStoryTimer]);

  // Pause / resume handling for play state
  useEffect(() => {
    if (isPlaying) {
      startStoryTimer();
      if (story?.type === "VIDEO" && videoRef.current) {
        // try to play the video
        videoRef.current.muted = isMuted;
        const p = videoRef.current.play();
        if (p && p.catch) p.catch(() => {});
      }
    } else {
      // pause timers and video
      clearTimers();
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // helpers for navigation
  const nextStory = useCallback(() => {
    clearTimers();
    setProgress(0);
    if (current < stories.length - 1) {
      setCurrent((c) => c + 1);
    } else if (hasNextStorySet && onNextStorySet) {
      onNextStorySet();
    }
  }, [current, stories.length, hasNextStorySet, onNextStorySet, clearTimers]);

  const prevStory = useCallback(() => {
    clearTimers();
    setProgress(0);
    if (current > 0) {
      setCurrent((c) => c - 1);
    } else if (hasPrevStorySet && onPrevStorySet) {
      onPrevStorySet();
    }
  }, [current, hasPrevStorySet, onPrevStorySet, clearTimers]);

  const togglePlayPause = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlaying((p) => !p);
  }, []);

  const toggleMute = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted((m) => {
      const next = !m;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }, []);

  // keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevStory();
      if (e.key === "ArrowRight") nextStory();
      if (e.key === " ") {
        e.preventDefault();
        togglePlayPause();
      }
      if (e.key === "m") toggleMute();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prevStory, nextStory, togglePlayPause, toggleMute]);

  // touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const end = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - end;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextStory();
      else prevStory();
    }
  };

  const handleScreenClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) prevStory();
    else nextStory();
  };

  // when video metadata loads, start if we are on that story and playing
  const handleVideoLoadedMetadata = () => {
    // only start timer if the loaded video is the current story and is playing
    if (story?.type === "VIDEO" && isPlaying) {
      // small delay to allow video.duration to be set
      setTimeout(() => startStoryTimer(), 20);
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
            ref={(el) => {
              videoRef.current = el;
            }}
            src={story.mediaUrl}
            className="w-full h-full object-cover"
            muted={isMuted}
            onLoadedMetadata={handleVideoLoadedMetadata}
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
              className="h-full bg-white transition-all"
              style={{
                width:
                  i === current ? `${progress}%` : i < current ? "100%" : "0%",
                transitionDuration: i === current ? "50ms" : "200ms",
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
