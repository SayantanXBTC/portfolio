import { profile } from "../../data/portfolio";
import { Reveal } from "../kit/Reveal";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-ink">
      <Reveal from="up" distance={0.4} className="container-x flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="label text-dim">
          {profile.name} <span className="mx-2">·</span> © {new Date().getFullYear()}
        </p>
        <ul className="flex flex-wrap gap-x-7 gap-y-3">
          {profile.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target={s.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="label link-underline pb-1 text-mute transition-colors hover:text-paper"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </footer>
  );
}
