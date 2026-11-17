import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const ACCENTS = [
  { id: "red", label: "Red", hex: "#b11226", bright: "#d61f36" },
  { id: "blue", label: "Electric Blue", hex: "#2f6bff", bright: "#5b8cff" },
  { id: "emerald", label: "Emerald", hex: "#0f9d6e", bright: "#19c58b" },
  { id: "violet", label: "Violet", hex: "#7c3aed", bright: "#9a63f5" },
  { id: "amber", label: "Amber", hex: "#d97706", bright: "#f59e0b" },
];

const KEY = "portfolio-accent";
const AccentContext = createContext(null);

function readStored() {
  try {
    const v = localStorage.getItem(KEY);
    return ACCENTS.some((a) => a.id === v) ? v : "red";
  } catch {
    return "red";
  }
}

export function AccentProvider({ children }) {
  const [accentId, setAccentId] = useState(readStored);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      root.dataset.accent = accentId;
    };
    // a change of accent crossfades the whole page, where the browser can do that
    const changing = root.dataset.accent && root.dataset.accent !== accentId;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (changing && !still && typeof document.startViewTransition === "function") document.startViewTransition(apply);
    else apply();
    try {
      localStorage.setItem(KEY, accentId);
    } catch {
      /* storage can be blocked; the theme still applies for this visit */
    }
  }, [accentId]);

  const setAccent = useCallback((id) => setAccentId(id), []);
  const accent = useMemo(() => ACCENTS.find((a) => a.id === accentId) ?? ACCENTS[0], [accentId]);

  const value = useMemo(() => ({ accent, accents: ACCENTS, setAccent }), [accent, setAccent]);
  return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;
}

export const useAccent = () => useContext(AccentContext);
