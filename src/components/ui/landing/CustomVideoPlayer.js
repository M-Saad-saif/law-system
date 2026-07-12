"use client";
import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Rewind,
  FastForward,
  Maximize,
  Minimize,
} from "lucide-react";
import { DASH_MAIN } from "./motion";

export default function CustomVideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    setVideoError(false);
  };

  const handleMediaError = () => {
    setVideoError(true);
    setIsPlaying(false);
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
        setVideoError(false);
      } catch (error) {
        setVideoError(true);
        setIsPlaying(false);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleRewind = () => {
    videoRef.current.currentTime = Math.max(
      0,
      videoRef.current.currentTime - 5,
    );
  };

  const handleForward = () => {
    videoRef.current.currentTime = Math.min(
      duration,
      videoRef.current.currentTime + 5,
    );
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      setIsFullscreen(!!document.fullscreenElement);
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    videoRef.current.currentTime = percentage * duration;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative">
      <h3 className="font-heading text-4xl md:text-5xl font-bold text-[#053433] text-center mb-8">
        Product Tour
      </h3>
      <div
        ref={containerRef}
        className={`relative rounded-[2rem] overflow-hidden shadow-2xl bg-[#053433] ${
          isFullscreen ? "w-screen h-screen" : "aspect-video"
        }`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          poster={poster || DASH_MAIN}
          className="w-full h-full object-contain bg-black"
          onClick={togglePlay}
          onCanPlay={() => setVideoError(false)}
          onError={handleMediaError}
          onDoubleClick={handleFullscreen}
          playsInline
          preload="metadata"
          controls={false}
        >
          {src ? <source src={src} type="video/mp4" /> : null}
        </video>

        {(!src || videoError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#053433] text-white text-center px-6">
            Video is unavailable.
          </div>
        )}

        {/* Big play/pause overlay - only shows when paused */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity duration-300 hover:bg-black/40"
            onClick={togglePlay}
          >
            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <Play size={40} className="text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Custom controls - show on hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-16 pb-4 px-6 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        >
          {/* Progress bar */}
          <div
            className="h-1.5 bg-white/30 rounded-full cursor-pointer mb-4 hover:h-2 transition-all duration-200"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-white rounded-full relative"
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleRewind}
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                title="Rewind 5 seconds"
              >
                <Rewind size={18} className="text-white" />
              </button>

              <button
                onClick={togglePlay}
                className="h-12 w-12 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center hover:bg-white/35 transition-all duration-200"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={20} className="text-white fill-white" />
                ) : (
                  <Play size={20} className="text-white fill-white ml-0.5" />
                )}
              </button>

              <button
                onClick={handleForward}
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                title="Forward 5 seconds"
              >
                <FastForward size={18} className="text-white" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-white/90 text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              <button
                onClick={handleFullscreen}
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                title={isFullscreen ? "Exit fullscreen" : "Expand video"}
              >
                {isFullscreen ? (
                  <Minimize size={18} className="text-white" />
                ) : (
                  <Maximize size={18} className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
