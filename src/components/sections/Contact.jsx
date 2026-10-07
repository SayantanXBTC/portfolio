import { useState } from "react";
import { profile } from "../../data/portfolio";
import { MaskLines } from "../kit/Text";
import { Reveal } from "../kit/Reveal";
import { Arrow } from "../kit/Button";
import { Magnetic } from "../kit/Magnetic";
import { Stagger, Item } from "../kit/Stagger";

const links = [
  { label: "GitHub", href: profile.socials.find((s) => s.label === "GitHub").href },
  { label: "LinkedIn", href: profile.socials.find((s) => s.label === "LinkedIn").href },
  { label: "Resume", href: profile.resume },
];

/**
 * Closing frame. The opening film returns behind it (see HeroBackground), the
 * subject on the right, the last words on the left.
 */
export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative z-10 flex min-h-[100svh] flex-col justify-end overflow-x-clip pb-16 pt-40 landscape:justify-center landscape:pb-24"
    >
      <div className="container-x">
        <div className="max-w-[min(100%,46rem)] landscape:max-w-[min(48vw,46rem)]">
          <Reveal from="none" className="label mb-10 flex items-center gap-4 text-mute">
            <span className="h-px w-10 bg-accent-strong" />
            Contact — the last frame
          </Reveal>

          <MaskLines
            id="contact-title"
            lines={["Let's build", "something", "worth testing."]}
            stagger={0.14}
            className="display text-[clamp(2.6rem,11vw,5rem)] landscape:text-[clamp(2.6rem,5.8vw,6.6rem)]"
            renderLine={(l, i) => (i === 2 ? <span className="text-paper/55">{l}</span> : l)}
          />

          <Reveal from="none" delay={0.4} duration={1.6} className="mt-12 md:mt-16">
            <p className="label mb-3 text-dim">Write to me</p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${profile.email}`}
                className="link-underline break-all pb-1 text-[clamp(1.05rem,2vw,1.7rem)] font-medium tracking-tight"
              >
                {profile.email}
              </a>
              <button
                type="button"
                onClick={copy}
                aria-live="polite"
                className="label rounded-full border border-white/15 px-3.5 py-2 text-mute transition-colors duration-500 hover:border-paper hover:text-paper"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </Reveal>

          <Reveal from="none" delay={0.55} duration={1.6} className="mt-10">
            <Stagger as="ul" className="flex flex-wrap gap-3" gap={0.1} delay={0.5}>
              {links.map((l) => (
                <Item as="li" kind="pop" key={l.label}>
                  <Magnetic>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-ink/40 px-5 py-2.5 text-sm backdrop-blur-sm transition-colors duration-500 hover:border-paper hover:bg-paper hover:text-ink"
                    >
                      {l.label}
                      <span className="transition-transform duration-500 ease-cine group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                        <Arrow dir="up" />
                      </span>
                    </a>
                  </Magnetic>
                </Item>
              ))}
            </Stagger>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
