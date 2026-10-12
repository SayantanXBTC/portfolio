import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { profile } from "../../data/portfolio";
import { EASE } from "../../lib/asset";
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

// Messages are delivered by FormSubmit (no server of our own). The very first
// message sends an activation email to the inbox; until that link is clicked,
// sending falls back to opening the visitor's email app with the message filled in.
const ENDPOINT = `https://formsubmit.co/ajax/${profile.email}`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const mailto = (f) =>
  `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${f.name || "your portfolio"}`)}&body=${encodeURIComponent(`${f.message}\n\n— ${f.name} (${f.email})`)}`;

/** Local time in Agartala, kept current. */
function useLocalTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  const time = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true }).format(now);
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }).format(now));
  return { time: time.toUpperCase(), day: hour >= 7 && hour < 23 };
}

/** A line of the send report, styled like a test result. */
function Check({ ok, children, delay = 0 }) {
  return (
    <motion.li
      className={`flex items-center gap-2.5 font-mono text-[0.78rem] ${ok ? "text-paper/85" : "text-[#ff8a8a]"}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      <span className={ok ? "text-accent-strong" : ""}>{ok ? "✓" : "✗"}</span>
      {children}
    </motion.li>
  );
}

/**
 * Write without leaving the page. Sending runs like a test: the fields are
 * checked line by line, then delivery, and the report says what passed.
 */
function MessageForm() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState("idle"); // idle | checking | sending | sent | failed | invalid
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const checks = [
    { ok: form.name.trim().length > 1, pass: "name present", fail: "name: expected your name" },
    { ok: EMAIL_RE.test(form.email.trim()), pass: "email looks valid", fail: "email: expected a valid address" },
    { ok: form.message.trim().length > 9, pass: "message written", fail: "message: expected a few words" },
  ];

  const submit = async (e) => {
    e.preventDefault();
    if (state === "sending") return;
    if (!checks.every((c) => c.ok)) {
      setState("invalid");
      return;
    }
    setState("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          _subject: `Portfolio message from ${form.name.trim()}`,
          _template: "table",
          _captcha: "false",
        }),
      });
      const data = await res.json().catch(() => ({}));
      setState(res.ok && String(data.success) === "true" ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  };

  const field =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[0.95rem] text-paper outline-none transition-[border-color,background-color] duration-300 placeholder:text-dim focus:border-white/30 focus:bg-white/[0.05]";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state === "sent" ? (
        <motion.div
          key="sent"
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <ul className="space-y-2">
            {checks.map((c, i) => (
              <Check key={c.pass} ok delay={i * 0.18}>
                {c.pass}
              </Check>
            ))}
            <Check ok delay={0.6}>
              message delivered
            </Check>
          </ul>
          <motion.p
            className="label mt-4 border-t border-white/10 pt-4 text-accent-strong"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95 }}
          >
            4 passed · 0 failed — thank you, {form.name.trim().split(" ")[0]}. I&rsquo;ll write back.
          </motion.p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={submit}
          noValidate
          className="space-y-3"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="sr-only">Your name</span>
              <input className={field} name="name" autoComplete="name" placeholder="Your name" value={form.name} onChange={set("name")} />
            </label>
            <label className="block">
              <span className="sr-only">Your email</span>
              <input className={field} name="email" type="email" autoComplete="email" placeholder="Your email" value={form.email} onChange={set("email")} />
            </label>
          </div>
          <label className="block">
            <span className="sr-only">Message</span>
            <textarea className={`${field} min-h-[7.5rem] resize-y`} name="message" placeholder="What are we building?" value={form.message} onChange={set("message")} />
          </label>

          <AnimatePresence>
            {(state === "invalid" || state === "failed") && (
              <motion.ul
                className="space-y-1.5 overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                aria-live="polite"
              >
                {state === "invalid" &&
                  checks.map((c) => (
                    <Check key={c.pass} ok={c.ok}>
                      {c.ok ? c.pass : c.fail}
                    </Check>
                  ))}
                {state === "failed" && (
                  <Check ok={false}>
                    delivery: couldn&rsquo;t send from here —{" "}
                    <a href={mailto(form)} className="link-underline text-paper">
                      open it in your email app
                    </a>
                  </Check>
                )}
              </motion.ul>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={state === "sending"}
              className="group inline-flex items-center gap-3 rounded-full bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-transform duration-500 ease-cine hover:-translate-y-0.5 disabled:opacity-70"
            >
              {state === "sending" ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
                  Running…
                </>
              ) : (
                <>
                  Send message
                  <span className="transition-transform duration-500 ease-cine group-hover:translate-x-1">
                    <Arrow />
                  </span>
                </>
              )}
            </button>
            <span className="label text-dim">npm run send</span>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

/**
 * Closing frame. The opening photo returns behind it (see HeroBackground),
 * this time with the world in black and white; the last words on the left,
 * with a way to write right here.
 */
export default function Contact() {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [writing, setWriting] = useState(false);
  const clock = useLocalTime();

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
          <Reveal from="none" className="label mb-10 flex flex-wrap items-center gap-x-4 gap-y-3 text-mute">
            <span className="h-px w-10 bg-accent-strong" />
            Contact — the last frame
            <span className="flex items-center gap-2 text-dim">
              <span className={`relative flex h-1.5 w-1.5 ${clock.day ? "" : "opacity-60"}`}>
                {clock.day && <span className="absolute inset-0 animate-ping rounded-full bg-accent-strong opacity-70" />}
                <span className="relative h-1.5 w-1.5 rounded-full bg-accent-strong" />
              </span>
              Agartala · <span className="tabular-nums text-paper/80">{clock.time}</span> IST · {clock.day ? "daytime here" : "night here"}
            </span>
          </Reveal>

          <MaskLines
            id="contact-title"
            lines={["Let's build", "something", "worth testing."]}
            stagger={0.14}
            className="display text-[clamp(2.6rem,11vw,5rem)] landscape:text-[clamp(2.6rem,5.8vw,6.6rem)]"
            renderLine={(l, i) => (i === 2 ? <span className="text-paper/55">{l}</span> : l)}
          />

          <Reveal from="none" delay={0.4} duration={1.6} className="mt-12 md:mt-14">
            <p className="label mb-3 text-dim">Write to me</p>
            <div className="flex flex-wrap items-center gap-4">
              <Magnetic strength={0.12}>
                <a
                  href={`mailto:${profile.email}`}
                  className="link-underline block break-all pb-1 text-[clamp(1.05rem,2vw,1.7rem)] font-medium tracking-tight transition-colors duration-300 hover:text-accent-strong"
                >
                  {profile.email}
                </a>
              </Magnetic>
              <button
                type="button"
                onClick={copy}
                aria-live="polite"
                className="label rounded-full border border-white/15 px-3.5 py-2 text-mute transition-colors duration-500 hover:border-paper hover:text-paper"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </Reveal>

          <Reveal from="none" delay={0.5} duration={1.6} className="mt-8">
            <button
              type="button"
              onClick={() => setWriting((v) => !v)}
              aria-expanded={writing}
              className="group inline-flex items-center gap-3 text-[0.95rem] text-paper/80 transition-colors hover:text-paper"
            >
              <span className={`grid h-7 w-7 place-items-center rounded-full border border-white/20 transition-transform duration-500 ease-cine ${writing ? "rotate-45" : ""}`}>+</span>
              {writing ? "Close the message form" : "Or send a message right here"}
            </button>
            <AnimatePresence initial={false}>
              {writing && (
                <motion.div
                  className="overflow-hidden"
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <div className="pt-5">
                    <MessageForm />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                      className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-ink/60 px-5 py-2.5 text-sm transition-colors duration-500 hover:border-paper hover:bg-paper hover:text-ink"
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
