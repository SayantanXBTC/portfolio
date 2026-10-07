import { useEffect, useState } from "react";

// Types `text` one character at a time. `speed` is ms per character.
export function useTypewriter(text, { speed = 38, startDelay = 0, enabled = true } = {}) {
  const [count, setCount] = useState(enabled ? 0 : text.length);

  useEffect(() => {
    if (!enabled) {
      setCount(text.length);
      return undefined;
    }
    setCount(0);
    let interval;
    const start = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, speed, startDelay, enabled]);

  return { text: text.slice(0, count), done: count >= text.length };
}
