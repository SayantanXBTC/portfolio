import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import emailjs from "emailjs-com";
import { profile } from "../../data/portfolio";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal } from "../kit/Reveal";
import { Button, Arrow } from "../kit/Button";
import { Magnetic } from "../kit/Magnetic";

// Existing EmailJS configuration, unchanged.
const SERVICE_ID = "service_iqvvqxr";
const TEMPLATE_ID = "template_iqvvqxr";
const USER_ID = "Iq_vvQXRiqvvqxr";

function Field({ label, name, type = "text", value, onChange, multiline, delay }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <Reveal from="right" distance={0.6} delay={delay} className="group relative">
      <label htmlFor={name} className="label mb-2 block text-dim transition-colors duration-500 group-focus-within:text-accent-strong">
        {label}
      </label>
      <Tag
        id={name}
        name={name}
        type={multiline ? undefined : type}
        rows={multiline ? 4 : undefined}
        value={value}
        onChange={onChange}
        required
        autoComplete={name === "name" ? "name" : name === "email" ? "email" : "off"}
        className="w-full resize-none border-0 border-b border-white/15 bg-transparent px-0 py-3 text-lg text-paper placeholder:text-dim focus:border-accent-strong focus:outline-none focus:ring-0"
      />
      <span className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent-strong transition-transform duration-700 ease-cine group-focus-within:scale-x-100" />
    </Reveal>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // { ok, msg }
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    emailjs
      .send(SERVICE_ID, TEMPLATE_ID, { from_name: form.name, from_email: form.email, message: form.message }, USER_ID)
      .then(() => {
        setStatus({ ok: true, msg: "Message sent. I'll get back to you soon." });
        setForm({ name: "", email: "", message: "" });
      })
      .catch(() => setStatus({ ok: false, msg: "Could not send. Please email me directly instead." }))
      .finally(() => setLoading(false));
  };

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
    <section id="contact" aria-labelledby="contact-title" className="relative z-10 overflow-x-clip bg-ink py-28 md:py-44">
      <div className="container-x">
        <SectionHeader index="07" label="Contact" lines={["Let's build", "something."]} watermark="CONTACT" />
        <h2 id="contact-title" className="sr-only">
          Contact
        </h2>

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <Reveal from="left" className="max-w-lg text-lg leading-relaxed text-mute">
              Have a project in mind or want to collaborate? I'd love to hear from you.
            </Reveal>

            <Reveal from="left" delay={0.1} className="mt-12">
              <p className="label mb-3 text-dim">Email</p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={`mailto:${profile.email}`}
                  className="link-underline pb-1 text-[clamp(1.1rem,2.4vw,2rem)] font-medium tracking-tight break-all"
                >
                  {profile.email}
                </a>
                <button
                  type="button"
                  onClick={copy}
                  className="label rounded-full border border-white/15 px-3.5 py-2 text-mute transition-colors duration-500 hover:border-accent-strong hover:text-paper"
                  aria-live="polite"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </Reveal>

            <dl className="mt-12 grid gap-8 sm:grid-cols-2">
              <Reveal from="left" delay={0.15}>
                <dt className="label mb-3 text-dim">Phone</dt>
                <dd className="space-y-1 text-paper">
                  {profile.phones.map((p) => (
                    <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="link-underline block w-fit">
                      {p}
                    </a>
                  ))}
                </dd>
              </Reveal>
              <Reveal from="left" delay={0.2}>
                <dt className="label mb-3 text-dim">Location</dt>
                <dd className="text-paper">{profile.location}</dd>
              </Reveal>
            </dl>

            <Reveal from="left" delay={0.25} className="mt-12">
              <p className="label mb-4 text-dim">Elsewhere</p>
              <ul className="flex flex-wrap gap-3">
                {profile.socials.map((s) => (
                  <li key={s.label}>
                    <Magnetic>
                      <a
                        href={s.href}
                        target={s.href.startsWith("mailto") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 px-5 py-2.5 text-sm transition-colors duration-500 hover:border-accent-strong hover:bg-accent"
                      >
                        {s.label}
                        <span className="transition-transform duration-500 ease-cine group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                          <Arrow dir="up" />
                        </span>
                      </a>
                    </Magnetic>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href={profile.resume} variant="primary">
                  Download resume
                </Button>
              </div>
            </Reveal>
          </div>

          <form onSubmit={submit} className="space-y-8 lg:col-span-5 lg:col-start-8" aria-label="Send a message">
            <Field label="Your name" name="name" value={form.name} onChange={onChange} delay={0} />
            <Field label="Your email" name="email" type="email" value={form.email} onChange={onChange} delay={0.08} />
            <Field label="Your message" name="message" value={form.message} onChange={onChange} multiline delay={0.16} />

            <Reveal from="right" distance={0.6} delay={0.24} className="flex flex-wrap items-center gap-5">
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.96 }}
                className="group inline-flex items-center gap-3 rounded-full border border-accent bg-accent px-7 py-3.5 text-sm font-medium text-white transition-colors duration-500 hover:border-accent-strong hover:bg-accent-strong disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send message"}
                <span className="transition-transform duration-500 ease-cine group-hover:translate-x-1">
                  <Arrow />
                </span>
              </motion.button>
              <AnimatePresence mode="wait">
                {status && (
                  <motion.p
                    key={status.msg}
                    role="status"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className={`text-sm ${status.ok ? "text-paper" : "text-accent-strong"}`}
                  >
                    {status.msg}
                  </motion.p>
                )}
              </AnimatePresence>
            </Reveal>
          </form>
        </div>
      </div>
    </section>
  );
}
