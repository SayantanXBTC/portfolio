// Resolve a file in /public against the Vite base ("/portfolio/" in production).
export const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Cinematic easing used across every transition.
export const EASE = [0.16, 1, 0.3, 1];
