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
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  FlipHorizontal2,
  Captions,
  RotateCw,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { ChapterMarkers } from "@/components/player/ChapterMarkers";
import { PlayerTitlePoster } from "@/components/player/PlayerTitlePoster";
import { PlayerViewerWatermark } from "@/components/player/PlayerViewerWatermark";
import { VolumeControl } from "@/components/player/VolumeControl";
import { SpeedMenu } from "@/components/player/SpeedMenu";
import type { PlayerChapter } from "@/components/player/types";
import { Button } from "@/components/ui/Button";

export type { PlayerChapter } from "@/components/player/types";

interface CaptionsTrack {
  src: string;
  srcLang: string;
  label: string;
  default?: boolean;
}

interface DanceVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  chapters: PlayerChapter[];
  labels: Dictionary["player"];
  className?: string;
  /**
   * Optional VTT captions track. No mock/demo routine ships one today (real
   * caption authoring is ongoing content cost, not a one-time code fix — see
   * accessibility-priorities rule) — this just wires up the infrastructure
   * so a real CMS-provided VTT URL lights up the CC button automatically.
   */
  captions?: CaptionsTrack;
  /**
   * When true (default), the horizontal-flip control is shown and playback
   * starts mirrored so dancers can follow as if looking in a studio mirror.
   * Set false for footage that is already mirrored or has burned-in captions.
   */
  showMirror?: boolean;
  /** Signed-in email (or uid) drawn on the picture — deterrent, not DRM. */
  viewerLabel?: string;
}

export function DanceVideoPlayer({
  src,
  poster,
  title,
  chapters,
  labels,
  className,
  captions,
  showMirror = true,
  viewerLabel,
}: DanceVideoPlayerProps) {
  const resolvedTitle = title ?? labels.defaultTitle;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLTrackElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMirrored, setIsMirrored] = useState(showMirror);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(
    Boolean(captions?.default),
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
    const onError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
    };
  }, []);

  // Sync the <track>'s live TextTrack mode with the toggle — `default`/
  // `src` attributes alone don't control visibility once the track is
  // already loaded, only its `.track.mode` does.
  useEffect(() => {
    const track = trackRef.current?.track;
    if (!track) return;
    track.mode = captionsEnabled ? "showing" : "hidden";
  }, [captionsEnabled, captions?.src]);

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

  const toggleCaptions = () => setCaptionsEnabled((enabled) => !enabled);

  const handleRetry = () => {
    const video = videoRef.current;
    if (!video) return;
    setHasError(false);
    video.load();
    video.play().catch(() => {
      // Autoplay can still be blocked after a manual retry click (e.g. no
      // user-activation left in some browsers) — leave it paused rather
      // than re-entering the error state for an unrelated reason.
    });
  };

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
        "group relative w-full overflow-hidden rounded-2xl border border-frame-border bg-black",
        className
      )}
      onMouseMove={scheduleHideControls}
      onMouseLeave={() => isPlaying && setAreControlsVisible(false)}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          preload="auto"
          controlsList="nodownload"
          disablePictureInPicture
          disableRemotePlayback
          onContextMenu={(event) => event.preventDefault()}
          className="h-full w-full object-contain transition-transform duration-300"
          style={{ transform: isMirrored ? "scaleX(-1)" : "scaleX(1)" }}
          onClick={togglePlay}
          playsInline
        >
          {captions ? (
            <track
              ref={trackRef}
              kind="captions"
              src={captions.src}
              srcLang={captions.srcLang}
              label={captions.label}
              default={captions.default}
            />
          ) : null}
        </video>

        {viewerLabel && !hasError ? (
          <PlayerViewerWatermark label={viewerLabel} />
        ) : null}

        <PlayerTitlePoster
          title={resolvedTitle}
          show={!poster && !isPlaying && !hasError}
        />

        {/* Center play button, shown when paused */}
        {!hasError && !isPlaying && (
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

        {/* Mirrored indicator badge — also shown when the flip control is
            hidden because the footage is already mirrored in edit. */}
        {(isMirrored || !showMirror) && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            {labels.mirrored}
          </span>
        )}

        <span className="sr-only">{resolvedTitle}</span>

        {/* Controls overlay */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 sm:px-4",
            hasError && "hidden",
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

              {/* Captions toggle — only rendered when a track is actually
                  available, since there's nothing to toggle otherwise */}
              {captions ? (
                <button
                  type="button"
                  onClick={toggleCaptions}
                  aria-label={
                    captionsEnabled ? labels.captionsOn : labels.captionsOff
                  }
                  aria-pressed={captionsEnabled}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                    captionsEnabled
                      ? "border-frame-cyan text-frame-cyan"
                      : "border-white/15 text-white/80 hover:border-white/40 hover:text-white"
                  )}
                >
                  <Captions className="h-4 w-4" />
                </button>
              ) : null}

              {showMirror ? (
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
              ) : null}

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

        {/* Playback error overlay — last in DOM order so it stacks above
            the controls; replaces them entirely since seek/volume/speed
            are meaningless with no loaded media. */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 px-6 text-center">
            <p className="font-display text-lg font-bold text-white">
              {labels.videoErrorTitle}
            </p>
            <p className="text-sm text-frame-silver">{labels.videoErrorBody}</p>
            <Button onClick={handleRetry} className="py-2.5">
              <RotateCw className="h-4 w-4" />
              {labels.retry}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
