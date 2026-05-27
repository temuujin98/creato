import { useEffect, useRef } from "react";

const videoSrc =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4";

const fadeDurationSeconds = 0.5;

type BackgroundVideoProps = {
  className?: string;
};

export function BackgroundVideo({ className = "" }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const replayTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    const setOpacity = (opacity: number) => {
      video.style.opacity = String(Math.max(0, Math.min(1, opacity)));
    };

    const updateOpacity = () => {
      const { currentTime, duration } = video;

      if (!Number.isFinite(duration) || duration <= 0) {
        setOpacity(0);
      } else if (currentTime < fadeDurationSeconds) {
        setOpacity(currentTime / fadeDurationSeconds);
      } else if (duration - currentTime < fadeDurationSeconds) {
        setOpacity((duration - currentTime) / fadeDurationSeconds);
      } else {
        setOpacity(1);
      }

      frameRef.current = window.requestAnimationFrame(updateOpacity);
    };

    const startAnimation = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateOpacity);
      }
    };

    const handleEnded = () => {
      setOpacity(0);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      replayTimeoutRef.current = window.setTimeout(() => {
        video.currentTime = 0;
        void video.play();
        startAnimation();
      }, 100);
    };

    setOpacity(0);
    video.addEventListener("play", startAnimation);
    video.addEventListener("loadedmetadata", startAnimation);
    video.addEventListener("ended", handleEnded);

    const playPromise = video.play();
    if (playPromise) {
      void playPromise.catch(() => {
        setOpacity(0);
      });
    }

    return () => {
      video.removeEventListener("play", startAnimation);
      video.removeEventListener("loadedmetadata", startAnimation);
      video.removeEventListener("ended", handleEnded);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      if (replayTimeoutRef.current !== null) {
        window.clearTimeout(replayTimeoutRef.current);
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      muted
      playsInline
      autoPlay
      preload="auto"
      src={videoSrc}
    />
  );
}
