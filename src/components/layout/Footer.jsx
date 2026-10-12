import { useRef } from "react";
import { useInView } from "framer-motion";
import { profile } from "../../data/portfolio";

const LINE = ["Let's build something worth testing", "Automation Engineer", "Full-Stack Developer", "Agartala, India"];

/** One line of type sliding past for good, the last thing on the page. Pauses when off screen. */
function Marquee() {
  const ref = useRef(null);
  const live = useInView(ref, { margin: "100px 0px 100px 0px" });
  const run = [...LINE, ...LINE];
  return (
    <div ref={ref} data-live={live} aria-hidden="true" className="overflow-hidden border-b border-white/[0.07] py-6 md:py-8">
      <div className="flex w-max animate-[marquee_48s_linear_infinite] motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {run.map((t, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span className={`display whitespace-nowrap px-6 text-[clamp(2rem,6vw,5rem)] md:px-10 ${i % 2 ? "stroke-text" : "text-paper/90"}`}>{t}</span>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-strong md:h-3 md:w-3" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-ink">
      <Marquee />
      <div className="container-x grid gap-6 py-10 md:grid-cols-3 md:items-center">
        <p className="label text-dim">
          {profile.name} <span className="mx-2">·</span> © {new Date().getFullYear()}
        </p>
        <p className="label text-dim md:text-center">
          {profile.location} <span className="mx-2">·</span>
          <a href={`tel:${profile.phones[0].replace(/\s/g, "")}`} className="link-underline pb-0.5 hover:text-paper">
            {profile.phones[0]}
          </a>
        </p>
        <ul className="flex flex-wrap gap-x-7 gap-y-3 md:justify-end">
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
      </div>
    </footer>
  );
}
