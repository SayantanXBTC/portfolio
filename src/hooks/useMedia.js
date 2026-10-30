import { useEffect, useState } from "react";

export function useMedia(query, initial = false) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? initial : window.matchMedia(query).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

// Tall enough for the pinned scroll choreography: every desktop, tablet and phone held upright.
// Only short landscape screens (a phone on its side) get the stacked layouts.
export const PINNED_QUERY = "(min-height: 500px)";
export const usePinnedLayout = () => useMedia(PINNED_QUERY);
// Taller than wide: pinned scenes lay themselves out top to bottom instead of side by side.
export const usePortrait = () => useMedia("(max-aspect-ratio: 1/1)");
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
export const useHorizontalPin = () => useMedia("(min-width: 1024px) and (min-height: 640px)");
