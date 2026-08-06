"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  FlipHorizontal2,
  Gauge,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

export interface VideoChapter {
  id: string;
  label: string;
  /** Timestamp in seconds where this section of the routine begins. */
  time: number;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25] as const;

const DEFAULT_CHAPTERS: VideoChapter[] = [
  { id: "full-performance", label: "הופעה מלאה", time: 0 },
  { id: "breakdown", label: "פירוק תנועות (ספירות)", time: 18 },
  { id: "slow-practice", label: "תרגול איטי (50%)", time: 52 },
  { id: "full-speed", label: "תרגול במהירות מלאה (100%)", time: 90 },
];

interface DanceVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  chapters?: VideoChapter[];
  className?: string;
}

export function DanceVideoPlayer({
  src,
  poster,
  title = "תצוגה מקדימה של הרוטינה",
  chapters = DEFAULT_CHAPTERS,
  className,
}: DanceVideoPlayerProps) {
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
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState<string>(
    chapters[0]?.id ?? ""
  );

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

  // Highlight whichever chapter the current playhead is inside.
  useEffect(() => {
    const sorted = [...chapters].sort((a, b) => a.time - b.time);
    const current = sorted.reduce<VideoChapter | undefined>((acc, chapter) => {
      return currentTime >= chapter.time ? chapter : acc;
    }, sorted[0]);
    if (current) setActiveChapterId(current.id);
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
    setShowSpeedMenu(false);
  };

  const jumpToChapter = (chapter: VideoChapter) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = chapter.time;
    setCurrentTime(chapter.time);
    setActiveChapterId(chapter.id);
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

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-frame-border bg-black",
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
            aria-label="הפעל וידאו"
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-frame-bg shadow-glow transition-transform hover:scale-105 sm:h-16 sm:w-16">
              <Play className="ml-1 h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" />
            </span>
          </button>
        )}

        {/* Mirrored indicator badge */}
        {isMirrored && (
          <span
            dir="rtl"
            className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm"
          >
            במראה
          </span>
        )}

        <span className="sr-only">{title}</span>

        {/* Controls overlay */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 sm:px-4",
            areControlsVisible || !isPlaying
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
        >
          {/* Chapter / timeline markers */}
          <div className="mb-3 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                dir="rtl"
                onClick={() => jumpToChapter(chapter)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors sm:text-xs",
                  activeChapterId === chapter.id
                    ? "border-frame-accent bg-frame-accent/15 text-frame-accent"
                    : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
                )}
              >
                {chapter.label}
              </button>
            ))}
          </div>

          {/* Seek bar */}
          <input
            type="range"
            className="frame-range w-full cursor-pointer"
            style={{ "--range-progress": `${progressPercent}%` } as React.CSSProperties}
            min={0}
            max={duration || 0}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
            aria-label="התקדמות בסרטון"
          />

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "השהה" : "נגן"}
                className="flex h-8 w-8 items-center justify-center rounded-full text-frame-silver transition-colors hover:text-white"
              >
                {isPlaying ? (
                  <Pause className="h-[18px] w-[18px]" />
                ) : (
                  <Play className="h-[18px] w-[18px]" fill="currentColor" />
                )}
              </button>

              <div className="hidden items-center gap-1.5 sm:flex">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "בטל השתקה" : "השתק"}
                  className="flex h-8 w-8 items-center justify-center text-frame-silver transition-colors hover:text-white"
                >
                  <VolumeIcon className="h-4 w-4" />
                </button>
                <input
                  type="range"
                  className="frame-range w-16 cursor-pointer"
                  style={{ "--range-progress": `${volumePercent}%` } as React.CSSProperties}
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="עוצמת קול"
                />
              </div>

              <span className="text-xs font-medium tabular-nums text-white/80">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Playback speed */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSpeedMenu((open) => !open)}
                  aria-label="מהירות ניגון"
                  aria-expanded={showSpeedMenu}
                  className={cn(
                    "flex h-8 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition-colors",
                    showSpeedMenu
                      ? "border-frame-accent text-frame-accent"
                      : "border-white/15 text-white/80 hover:border-white/40 hover:text-white"
                  )}
                >
                  <Gauge className="h-3.5 w-3.5" />
                  {playbackRate}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-10 right-0 z-10 flex flex-col overflow-hidden rounded-xl border border-frame-border bg-frame-panel shadow-xl">
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        dir="rtl"
                        onClick={() => setSpeed(speed)}
                        className={cn(
                          "px-4 py-2 text-right text-xs font-medium whitespace-nowrap transition-colors hover:bg-white/5",
                          playbackRate === speed
                            ? "text-frame-accent"
                            : "text-white/80"
                        )}
                      >
                        {speed}x{speed === 1 ? " · רגיל" : ""}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mirror toggle */}
              <button
                type="button"
                onClick={toggleMirror}
                aria-label="מצב מראה"
                aria-pressed={isMirrored}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                  isMirrored
                    ? "border-frame-accent text-frame-accent"
                    : "border-white/15 text-white/80 hover:border-white/40 hover:text-white"
                )}
              >
                <FlipHorizontal2 className="h-4 w-4" />
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "צא ממסך מלא" : "מסך מלא"}
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
