import { profile } from "../../data/portfolio";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-ink">
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
