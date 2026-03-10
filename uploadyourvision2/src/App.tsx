import { useState, useEffect, useRef } from "react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&family=Syne:wght@400;600;800&display=swap');

*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body { cursor: none; overflow-x: hidden; }

.font-cormorant { font-family: 'Cormorant Garamond', serif; }
.font-syne      { font-family: 'Syne', sans-serif; }
.font-mono      { font-family: 'DM Mono', monospace; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes floatA {
  0%,100% { transform: translateY(0px) rotate(-1deg); }
  50%     { transform: translateY(-12px) rotate(0.5deg); }
}
@keyframes floatB {
  0%,100% { transform: translateY(0px) rotate(1deg); }
  50%     { transform: translateY(-8px) rotate(-0.5deg); }
}
@keyframes pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%     { opacity:0.5; transform:scale(1.4); }
}
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.anim-fade-up-1 { animation: fadeUp 0.8s ease 0.2s both; }
.anim-fade-up-2 { animation: fadeUp 1s ease 0.4s both; }
.anim-fade-up-3 { animation: fadeUp 1s ease 0.6s both; }
.anim-fade-up-4 { animation: fadeUp 1s ease 0.8s both; }
.anim-fade-in   { animation: fadeIn 1.4s ease 0.5s both; }
.float-a        { animation: floatA 6s ease-in-out infinite; }
.float-b        { animation: floatB 7s ease-in-out infinite; }
.float-c        { animation: floatA 8s ease-in-out 1s infinite; }
.float-d        { animation: floatB 5s ease-in-out 0.5s infinite; }
.pulse          { animation: pulse 2s infinite; }
.marquee-track  { animation: marquee 22s linear infinite; }

.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

.cursor-dot  { position:fixed; width:10px; height:10px; background:#c9622f; border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition: width .3s, height .3s; mix-blend-mode:multiply; }
.cursor-ring { position:fixed; width:36px; height:36px; border:1px solid #c9622f; border-radius:50%; pointer-events:none; z-index:9998; transform:translate(-50%,-50%); transition: width .3s, height .3s; opacity:0.5; }
.cursor-dot.big  { width:20px; height:20px; }
.cursor-ring.big { width:56px; height:56px; }

.bg-grid {
  position:fixed; inset:0; pointer-events:none; z-index:0;
  background-image: linear-gradient(rgba(14,14,13,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,14,13,.06) 1px, transparent 1px);
  background-size: 60px 60px;
}

.color-bar { height:4px; background: linear-gradient(90deg,#c9622f,#e8b49a,#e8ddd0); border-radius:2px; margin-top:12px; }

.step-card:hover  { background: #e8ddd0; }
.nd-card:hover    { border-left-color: #c9622f; background: #e8ddd0; }
.price-card:hover { background: rgba(255,255,255,.08); }
.upload-zone:hover { border-color:#c9622f; background:#faf9f6; }
.btn-primary:hover { background:#c9622f; transform:translateY(-2px); }
.btn-ghost:hover  { color:#0e0e0d; }
.price-cta:hover  { background:#f5f2ec; color:#0e0e0d; }
`;

// ─── Cursor ──────────────────────────────────────────────────────────────────
function Cursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const pos     = useRef({ mx:0, my:0, rx:0, ry:0 });

  useEffect(() => {
    const onMove = (e) => {
      pos.current.mx = e.clientX;
      pos.current.my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + "px";
        dotRef.current.style.top  = e.clientY + "px";
      }
    };
    document.addEventListener("mousemove", onMove);
    let raf;
    const loop = () => {
      const p = pos.current;
      p.rx += (p.mx - p.rx) * 0.12;
      p.ry += (p.my - p.ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = p.rx + "px";
        ringRef.current.style.top  = p.ry + "px";
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    const grow = () => { dotRef.current?.classList.add("big"); ringRef.current?.classList.add("big"); };
    const shrink = () => { dotRef.current?.classList.remove("big"); ringRef.current?.classList.remove("big"); };
    document.querySelectorAll("a,button,.step-card,.nd-card,.price-card,.upload-zone").forEach(el => {
      el.addEventListener("mouseenter", grow);
      el.addEventListener("mouseleave", shrink);
    });
    return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div className="cursor-dot"  ref={dotRef}  />
      <div className="cursor-ring" ref={ringRef} />
    </>
  );
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── FloatCard ────────────────────────────────────────────────────────────────
function FloatCard({ cls, animClass, children }) {
  return (
    <div
      className={`absolute bg-[#faf9f6] border border-[#e8ddd0] shadow-[0_8px_48px_rgba(14,14,13,0.08)] p-5 ${cls} ${animClass}`}
    >
      {children}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-12 py-6 mix-blend-multiply">
      <span className="font-syne font-extrabold text-[13px] tracking-[0.2em] uppercase text-[#0e0e0d]">
        Bustling Creatives
      </span>
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#8a8075]">
        Visual-First Studio
      </span>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen grid grid-cols-2 items-center px-12 pt-[120px] pb-20 gap-16 z-10">
      {/* Left */}
      <div className="flex flex-col gap-8">
        <div className="anim-fade-up-1 flex items-center gap-4 font-mono text-[10px] tracking-[0.25em] uppercase text-[#c9622f]">
          <span className="block w-8 h-px bg-[#c9622f]" />
          Campaign 001 — Upload Your Vision
        </div>

        <h1 className="anim-fade-up-2 font-cormorant font-light text-[clamp(52px,7vw,96px)] leading-[1.0] tracking-[-0.02em] text-[#0e0e0d]">
          Your brand<br />lives in{" "}
          <em className="italic text-[#c9622f]">images</em>
          <br />not words.
        </h1>

        <p className="anim-fade-up-3 font-mono font-light text-[13px] leading-[1.8] text-[#8a8075] max-w-[420px]">
          Bustling Creatives is a founding design partner studio. You upload what
          inspires you. We translate it into a complete visual identity — without
          requiring you to explain it.
        </p>

        <div className="anim-fade-up-4 flex items-center gap-8">
          <a
            href="#upload"
            className="btn-primary bg-[#0e0e0d] text-[#f5f2ec] px-9 py-4 font-mono text-[11px] tracking-[0.15em] uppercase no-underline transition-all duration-300 cursor-none"
          >
            Upload Your Vision
          </a>
          <a
            href="#process"
            className="btn-ghost font-mono text-[11px] tracking-[0.15em] uppercase text-[#8a8075] no-underline border-b border-current pb-0.5 transition-colors duration-300 cursor-none"
          >
            See How It Works
          </a>
        </div>
      </div>

      {/* Right — floating cards */}
      <div className="anim-fade-in relative h-[560px]">
        <FloatCard cls="top-0 left-[10%] w-[200px]" animClass="float-a">
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#c9622f] mb-2">Direction 02</div>
          <div className="font-cormorant font-light text-[20px] leading-[1.2] text-[#0e0e0d]">Soft &<br />Editorial</div>
          <div className="color-bar" />
        </FloatCard>

        <FloatCard cls="top-[30%] right-0 w-[220px]" animClass="float-b">
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#c9622f] mb-2">Typography</div>
          <div className="font-cormorant italic font-light text-[28px] text-[#0e0e0d]">Aa Bb</div>
          <div className="flex gap-1.5 mt-3">
            {["#c9622f","#0e0e0d","#e8ddd0"].map(c => (
              <div key={c} className="w-6 h-6 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </FloatCard>

        <FloatCard cls="bottom-0 left-0 w-[240px]" animClass="float-c">
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#c9622f] mb-2">Client Upload</div>
          <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.1em] uppercase text-[#8a8075] mt-2">
            <div className="pulse w-2 h-2 rounded-full bg-[#4caf82]" />
            3 images received
          </div>
          <div className="font-cormorant font-light text-[16px] text-[#0e0e0d] mt-3">Translating now...</div>
        </FloatCard>

        <FloatCard cls="top-[15%] left-[45%] w-[160px]" animClass="float-d">
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#c9622f] mb-2">Brand Direction</div>
          <div className="font-cormorant font-light text-[20px] leading-[1.2] text-[#0e0e0d]">Bold &<br />Disruptive</div>
        </FloatCard>
      </div>
    </section>
  );
}

// ─── Manifesto ────────────────────────────────────────────────────────────────
function Manifesto() {
  return (
    <section className="reveal relative z-10 bg-[#0e0e0d] px-12 py-[120px] grid grid-cols-[200px_1fr] gap-20 items-start">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#8a8075] pt-3 sticky top-[120px]">
        Our Belief
      </div>
      <div className="font-cormorant font-light text-[clamp(28px,3.5vw,48px)] leading-[1.4] tracking-[-0.01em] text-[#f5f2ec]">
        Most founders know{" "}
        <strong className="font-normal text-[#e8b49a]">exactly</strong> what
        their brand should feel like.<br /><br />
        They just can't <em className="italic">say</em> it.<br /><br />
        They've been asked to fill out briefs, answer positioning questions,
        write copy decks — before anyone has drawn a single line.<br /><br />
        We do it differently.{" "}
        <strong className="font-normal text-[#e8b49a]">
          Show us your world. We'll build your brand.
        </strong>
      </div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function Marquee() {
  const items = ["Upload Your Vision","Visual-First","Founding Partner","No Briefs Required","Human-Led Studio","ND Friendly","Upload Your Vision","Visual-First","Founding Partner","No Briefs Required","Human-Led Studio","ND Friendly"];
  return (
    <div className="relative z-10 bg-[#c9622f] py-4 overflow-hidden">
      <div className="marquee-track flex gap-12 whitespace-nowrap">
        {[...items,...items].map((t, i) => (
          <span key={i} className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#faf9f6] flex items-center gap-12">
            {t} <span className="text-[#e8b49a]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Process ──────────────────────────────────────────────────────────────────
const STEPS = [
  { num:"01", icon:"↑", title:"Upload Your Inspiration", desc:"Enter your portal. Drop images, references, screenshots, links — anything that captures a feeling. No brief required. No words needed." },
  { num:"02", icon:"◈", title:"We Read the Visual",       desc:"Our designers study your uploads and build 3–4 distinct brand directions. Each one is a full stylescape: color, type, mood, UI references." },
  { num:"03", icon:"→", title:"You Choose Direction",     desc:"Review directions async in your portal. Select what resonates. Comment, react, or schedule a call — on your timeline, at your pace." },
  { num:"04", icon:"✦", title:"Full Identity Delivered",  desc:"We build your complete digital identity: typography system, color palette, imagery style, UI guidance, website visuals, and favicon." },
];

function Process() {
  return (
    <section id="process" className="reveal relative z-10 bg-[#faf9f6] px-12 py-[120px]">
      <div className="flex justify-between items-baseline mb-20 border-b border-[#e8ddd0] pb-6">
        <h2 className="font-syne font-extrabold text-[clamp(28px,3vw,40px)] tracking-[-0.02em] text-[#0e0e0d]">How It Works</h2>
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8a8075]">04 Steps</span>
      </div>
      <div className="grid grid-cols-4 gap-0.5">
        {STEPS.map(s => (
          <div key={s.num} className="step-card relative bg-[#f5f2ec] p-10 transition-colors duration-300 cursor-none">
            <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[#c9622f] mb-8">{s.num}</span>
            <div className="absolute top-10 right-8 w-10 h-10 border border-[#e8ddd0] flex items-center justify-center text-[18px] text-[#8a8075]">{s.icon}</div>
            <h3 className="font-cormorant font-light text-[28px] leading-[1.2] mb-4 text-[#0e0e0d]">{s.title}</h3>
            <p className="font-mono font-light text-[12px] leading-[1.8] text-[#8a8075]">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── ND Section ───────────────────────────────────────────────────────────────
const ND_CARDS = [
  { title:"No Word-Heavy Briefs",      desc:"Your intake is visual. Upload images, links, anything that captures a feeling. You never have to articulate what you can't yet say." },
  { title:"Async by Default",          desc:"Everything lives in your portal. Review when you're ready. No pressure to respond immediately. No surprise calls." },
  { title:"Clear, Structured Stages",  desc:"Each step is one decision. No ambiguity, no sprawl. You always know exactly where you are in the process." },
  { title:"A Partner, Not a Vendor",   desc:"We work as your founding design partner. We hold the creative standard so you don't have to manage every detail." },
  { title:"Human Throughout",          desc:"Every direction is designed by a human. Creative interpretation is never automated. There's always a designer behind the work." },
];

function NDSection() {
  return (
    <section className="reveal relative z-10 bg-[#f5f2ec] px-12 py-[120px] grid grid-cols-2 gap-24 items-center">
      <div>
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#c9622f] mb-6">Built for Every Kind of Mind</div>
        <h2 className="font-cormorant font-light text-[clamp(36px,4vw,56px)] leading-[1.15] mb-8 text-[#0e0e0d]">
          Designed to work<br />with <em className="italic text-[#c9622f]">how you think</em>,<br />not against it.
        </h2>
        <p className="font-mono font-light text-[13px] leading-[1.9] text-[#8a8075] mb-10">
          Traditional agency processes are built for linear thinkers: long questionnaires,
          rigid timelines, wall-to-wall calls. We built this studio for founders who don't
          work that way — because we don't either. Every touchpoint is intentionally calm,
          clear, and low-pressure.
        </p>
        <a href="#upload" className="btn-primary bg-[#0e0e0d] text-[#f5f2ec] px-9 py-4 font-mono text-[11px] tracking-[0.15em] uppercase no-underline transition-all duration-300 cursor-none inline-block">
          Enter the Studio
        </a>
      </div>
      <div className="flex flex-col gap-0.5">
        {ND_CARDS.map(c => (
          <div key={c.title} className="nd-card bg-[#faf9f6] px-8 py-7 border-l-[3px] border-transparent transition-all duration-300 cursor-none">
            <div className="font-syne font-semibold text-[14px] tracking-[0.05em] mb-2 text-[#0e0e0d]">{c.title}</div>
            <div className="font-mono font-light text-[11px] leading-[1.7] text-[#8a8075]">{c.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    tier:"Starter Identity", amount:"$4,500", featured:false,
    desc:"For founders who need a clear visual foundation to launch with confidence.",
    features:["Visual-first intake portal","3 stylescape directions","1 developed brand direction","Color + typography system","Logo & favicon","Async review process"],
  },
  {
    tier:"Full Rebrand", amount:"$8,500", featured:true, badge:"Most Chosen",
    desc:"Complete digital identity for founders ready to show up with authority.",
    features:["Everything in Starter","4 stylescape directions","Full UI style guide","Imagery & photography direction","Website visual system","Brand guardian review (30 days)"],
  },
  {
    tier:"Founding Partner", amount:"$14K+", featured:false,
    desc:"For founders who want us embedded as their ongoing creative partner.",
    features:["Everything in Full Rebrand","Ongoing brand guardianship","Monthly design retainer","Priority studio access","Campaign & launch support","Dedicated designer pairing"],
  },
];

function Pricing() {
  return (
    <section className="reveal relative z-10 bg-[#0e0e0d] px-12 py-[120px]">
      <div className="flex justify-between items-baseline mb-20 border-b border-white/10 pb-6">
        <h2 className="font-syne font-extrabold text-[clamp(28px,3vw,40px)] tracking-[-0.02em] text-[#f5f2ec]">Studio Packages</h2>
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8a8075]">Clear Scope. No Surprises.</span>
      </div>
      <div className="grid grid-cols-3 gap-0.5">
        {PLANS.map(p => (
          <div
            key={p.tier}
            className={`price-card relative p-12 transition-colors duration-300 cursor-none ${
              p.featured ? "bg-[#c9622f]" : "bg-white/[0.04]"
            }`}
          >
            {p.badge && (
              <div className="absolute -top-px right-10 bg-[#e8b49a] text-[#0e0e0d] font-mono text-[9px] tracking-[0.2em] uppercase px-3.5 py-1.5">
                {p.badge}
              </div>
            )}
            <div className={`font-mono text-[10px] tracking-[0.25em] uppercase mb-5 ${p.featured ? "text-white/70" : "text-[#8a8075]"}`}>
              {p.tier}
            </div>
            <div className="font-cormorant font-light text-[56px] leading-none mb-2 text-[#f5f2ec]">{p.amount}</div>
            <div className={`font-mono font-light text-[11px] leading-[1.7] mb-10 ${p.featured ? "text-white/80" : "text-[#8a8075]"}`}>
              {p.desc}
            </div>
            <ul className="flex flex-col gap-3.5">
              {p.features.map(f => (
                <li key={f} className={`font-mono font-light text-[11px] flex items-start gap-3 leading-[1.5] ${p.featured ? "text-white/80" : "text-[#f5f2ec]/60"}`}>
                  <span className={`flex-shrink-0 mt-px ${p.featured ? "text-white/60" : "text-[#e8b49a]"}`}>—</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#upload"
              className={`price-cta mt-12 inline-block px-7 py-3.5 font-mono text-[10px] tracking-[0.15em] uppercase no-underline transition-all duration-300 cursor-none border ${
                p.featured
                  ? "bg-[#0e0e0d] text-[#f5f2ec] border-[#0e0e0d]"
                  : "border-white/20 text-[#f5f2ec]"
              }`}
            >
              {p.tier === "Founding Partner" ? "Let's Talk" : "Begin Project"}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Upload CTA ───────────────────────────────────────────────────────────────
function UploadCTA() {
  return (
    <section id="upload" className="reveal relative z-10 bg-[#f5f2ec] py-40 px-12 text-center overflow-hidden">
      {/* Background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-syne font-extrabold text-[clamp(60px,12vw,160px)] tracking-[-0.03em] text-[#e8ddd0] whitespace-nowrap">
          UPLOAD YOUR VISION
        </span>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#c9622f]">The Studio is Open</div>
        <h2 className="font-cormorant font-light text-[clamp(40px,6vw,72px)] leading-[1.1] tracking-[-0.02em] text-[#0e0e0d]">
          Stop trying to<br /><em className="italic">explain</em> your brand.
        </h2>
        <p className="font-mono font-light text-[12px] leading-[1.8] text-[#8a8075] max-w-[480px]">
          Upload whatever inspires you. Screenshots, photos, references, textures.
          We'll read the visual and translate it into an identity that finally looks like you.
        </p>
        <div className="upload-zone w-[420px] h-40 border border-dashed border-[#8a8075] flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-none bg-white/50 backdrop-blur-sm">
          <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#8a8075]">Drop inspiration here</div>
          <div className="font-mono text-[10px] tracking-[0.1em] text-[#c9622f]">Images · Links · References · Anything</div>
        </div>
        <a href="#" className="btn-primary bg-[#0e0e0d] text-[#f5f2ec] px-9 py-4 font-mono text-[11px] tracking-[0.15em] uppercase no-underline transition-all duration-300 cursor-none inline-block">
          Enter the Studio Portal
        </a>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative z-10 bg-[#0e0e0d] px-12 py-16 flex justify-between items-center border-t border-white/[0.06]">
      <div className="font-syne font-extrabold text-[14px] tracking-[0.2em] uppercase text-[#f5f2ec]">Bustling Creatives</div>
      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#8a8075]">Visual-First · Human-Led · Founding Partner Studio</div>
      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#8a8075]">© 2025 — All Rights Reserved</div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function BustlingCreatives() {
  useReveal();

  return (
    <>
      <style>{FONTS}</style>
      <div className="bg-[#f5f2ec] text-[#0e0e0d] font-mono font-light overflow-x-hidden">
        <div className="bg-grid" />
        <Cursor />
        <Nav />
        <Hero />
        <Manifesto />
        <Marquee />
        <Process />
        <NDSection />
        <Pricing />
        <UploadCTA />
        <Footer />
      </div>
    </>
  );
}