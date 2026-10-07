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

// Wide + tall enough for the pinned / stacked scroll choreography.
export const usePinnedLayout = () => useMedia("(min-width: 1024px) and (min-height: 720px)");
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
export const useHorizontalPin = () => useMedia("(min-width: 1024px) and (min-height: 640px)");
