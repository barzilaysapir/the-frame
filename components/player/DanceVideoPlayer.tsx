"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { Play, Pause, Maximize, Minimize, FlipHorizontal2 } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { ChapterMarkers } from "@/components/player/ChapterMarkers";
import { VolumeControl } from "@/components/player/VolumeControl";
import { SpeedMenu } from "@/components/player/SpeedMenu";
import type { PlayerChapter } from "@/components/player/types";

export type { PlayerChapter } from "@/components/player/types";

interface DanceVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  chapters: PlayerChapter[];
  labels: Dictionary["player"];
  className?: string;
}

export function DanceVideoPlayer({
  src,
  poster,
  title,
  chapters,
  labels,
  className,
}: DanceVideoPlayerProps) {
  const resolvedTitle = title ?? labels.defaultTitle;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setAreControlsVisible(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!videoRef.current?.paused) setAreControlsVisible(false);
    }, 2800);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      setAreControlsVisible(true);
    };
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration || 0);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Whichever chapter the current playhead is inside — derived directly from
  // currentTime/chapters rather than mirrored into its own state.
  const activeChapterId = useMemo(() => {
    const sorted = [...chapters].sort((a, b) => a.time - b.time);
    const current = sorted.reduce<PlayerChapter | undefined>((acc, chapter) => {
      return currentTime >= chapter.time ? chapter : acc;
    }, sorted[0]);
    return current?.id ?? chapters[0]?.id ?? "";
  }, [currentTime, chapters]);

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(event.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextVolume = Number(event.target.value);
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleMirror = () => setIsMirrored((mirrored) => !mirrored);

  const setSpeed = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const jumpToChapter = (chapter: PlayerChapter) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = chapter.time;
    setCurrentTime(chapter.time);
    if (video.paused) video.play();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className={cn(
        "neon-frame-glow group relative w-full overflow-hidden rounded-2xl border border-frame-border bg-black",
        className
      )}
      onMouseMove={scheduleHideControls}
      onMouseLeave={() => isPlaying && setAreControlsVisible(false)}
    >
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="h-full w-full object-cover transition-transform duration-300"
          style={{ transform: isMirrored ? "scaleX(-1)" : "scaleX(1)" }}
          onClick={togglePlay}
          playsInline
        />

        {/* Center play button, shown when paused */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={labels.playVideo}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-frame-bg shadow-glow transition-transform hover:scale-105 sm:h-16 sm:w-16">
              <Play className="ml-1 h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" />
            </span>
          </button>
        )}

        {/* Mirrored indicator badge */}
        {isMirrored && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            {labels.mirrored}
          </span>
        )}

        <span className="sr-only">{resolvedTitle}</span>

        {/* Controls overlay */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 sm:px-4",
            areControlsVisible || !isPlaying
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
        >
          <ChapterMarkers
            chapters={chapters}
            activeChapterId={activeChapterId}
            onJumpToChapter={jumpToChapter}
          />

          {/* Seek bar */}
          <input
            type="range"
            className="frame-range w-full cursor-pointer"
            style={{ "--range-progress": `${progressPercent}%` } as CSSProperties}
            min={0}
            max={duration || 0}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
            aria-label={labels.seek}
          />

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? labels.pause : labels.play}
                className="flex h-8 w-8 items-center justify-center rounded-full text-frame-silver transition-colors hover:text-white"
              >
                {isPlaying ? (
                  <Pause className="h-[18px] w-[18px]" />
                ) : (
                  <Play className="h-[18px] w-[18px]" fill="currentColor" />
                )}
              </button>

              <VolumeControl
                volume={volume}
                isMuted={isMuted}
                labels={labels}
                onToggleMute={toggleMute}
                onVolumeChange={handleVolumeChange}
              />

              <span className="text-xs font-medium tabular-nums text-white/80">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <SpeedMenu
                playbackRate={playbackRate}
                labels={labels}
                onChangeSpeed={setSpeed}
              />

              {/* Mirror toggle */}
              <button
                type="button"
                onClick={toggleMirror}
                aria-label={labels.mirrorMode}
                aria-pressed={isMirrored}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                  isMirrored
                    ? "border-frame-magenta text-frame-magenta"
                    : "border-white/15 text-white/80 hover:border-white/40 hover:text-white"
                )}
              >
                <FlipHorizontal2 className="h-4 w-4" />
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen ? labels.exitFullscreen : labels.fullscreen
                }
                className="flex h-8 w-8 items-center justify-center rounded-full text-frame-silver transition-colors hover:text-white"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DanceVideoPlayer;
