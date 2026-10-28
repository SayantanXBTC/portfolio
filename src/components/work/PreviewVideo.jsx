import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * A muted, looping screen recording. The file is only requested once the player
 * comes near the viewport, and it only plays while it is actually on screen.
 * `media` swaps in another cut of the same project (the phone recording).
 * `load` holds the request back until the caller says so (scenes far down the flight).
 */
export function PreviewVideo({ project, media = project, label = "screen recording of the live product", videoRef, playing = true, load = true, className = "" }) {
  const local = useRef(null);
  const ref = videoRef ?? local;
  const inRange = useInView(ref, { once: true, margin: "900px 0px 900px 0px" });
  const [loaded, setLoaded] = useState(false);
  if (inRange && load && !loaded) setLoaded(true);
  const near = loaded;
  const visible = useInView(ref, { amount: 0.3 });

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (near && visible && playing) v.play()?.catch(() => {});
    else v.pause();
  }, [ref, near, visible, playing]);

  return (
    <video
      ref={ref}
      src={near ? media.video : undefined}
      poster={media.poster}
      width={media.w}
      height={media.h}
      muted
      loop
      playsInline
      disablePictureInPicture
      preload={near ? "auto" : "none"}
      aria-label={`${project.title}: ${label}`}
      className={`block h-auto w-full bg-ink-800 ${className}`}
    />
  );
}

const fmt = (s) => {
  const t = Math.max(0, Math.floor(s || 0));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

/** Follows a video element: "00:07 / 00:13" plus a 0..1 progress callback. */
export function useVideoClock(videoRef, onProgress) {
  const [clock, setClock] = useState({ now: 0, total: 0 });
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    const tick = () => {
      setClock((c) => {
        const now = Math.floor(v.currentTime);
        const total = Math.floor(v.duration || 0);
        return c.now === now && c.total === total ? c : { now, total };
      });
      onProgress?.(v.duration ? v.currentTime / v.duration : 0);
    };
    v.addEventListener("timeupdate", tick);
    v.addEventListener("loadedmetadata", tick);
    return () => {
      v.removeEventListener("timeupdate", tick);
      v.removeEventListener("loadedmetadata", tick);
    };
  }, [videoRef, onProgress]);
  return `${fmt(clock.now)} / ${fmt(clock.total)}`;
}
