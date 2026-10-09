"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  AudioLines,
  CircleHelp,
  Globe2,
  Headphones,
  Pause,
  Play,
  Radio,
  Waves,
} from "lucide-react";

type SignalKey = "temperature" | "ocean" | "forest";
type Language = "en" | "my";

const signals: Record<
  SignalKey,
  { color: string; frequency: number; level: number; unit: string }
> = {
  temperature: {
    color: "#f47556",
    frequency: 220,
    level: 1.24,
    unit: "°C anomaly",
  },
  ocean: { color: "#277f88", frequency: 164, level: 0.72, unit: "m sea level" },
  forest: { color: "#688b50", frequency: 196, level: 0.84, unit: "% canopy" },
};

const copy = {
  en: {
    eyebrow: "EARTH INFORMATION CENTER · SONIFICATION STUDIO",
    title: "Listen to a living planet.",
    subtitle:
      "Earth signals, translated into sound. Explore the patterns shaping our changing world.",
    live: "DEMO SIGNAL",
    sample: "Illustrative sample · not a live NASA feed",
    dataFrame: "EARTH DATA FRAME",
    global: "GLOBAL VIEW",
    latest: "LATEST READING",
    anomaly: "Global temperature anomaly",
    ocean: "Ocean level",
    forest: "Forest canopy",
    temperature: "Temperature",
    sound: "Sound studio",
    soundDesc: "Shape the way this signal is heard.",
    play: "Play sonification",
    pause: "Pause sonification",
    playing: "NOW PLAYING",
    ready: "READY TO PLAY",
    pitch: "PITCH",
    pulse: "PULSE",
    low: "LOW",
    high: "HIGH",
    dataStory: "A signal, made audible",
    dataDesc:
      "A rising reading lifts the pitch. A faster shift tightens the rhythm. Color carries the same story at a glance.",
    frequency: "Frequency",
    tempo: "Pulse rate",
    source: "Data note",
    sourceDetail:
      "This interactive demo uses a generated signal to show the sonification controls. Connect an EIC dataset for scientific readings.",
    access: "Designed for more than one sense",
    accessDesc:
      "Pair the visual trend with its audio counterpart, or follow the signal by listening alone.",
    navStudio: "Studio",
    navSignals: "Signals",
    navAbout: "About EIC",
    language: "Language",
    signalLabel: "CHOOSE A SIGNAL",
    tempShort: "Temperature",
    oceanShort: "Ocean",
    forestShort: "Forest",
    trend: "12-MONTH TREND",
  },
  my: {
    eyebrow: "EARTH INFORMATION CENTER · SONIFICATION STUDIO",
    title: "အသက်ဝင်နေသော ကမ္ဘာမြေကို နားဆင်ပါ။",
    subtitle:
      "ကမ္ဘာမြေ၏ အချက်အလက်များကို အသံအဖြစ် ပြောင်းလဲထားပါသည်။ ပြောင်းလဲနေသော ကမ္ဘာ၏ ပုံစံများကို လေ့လာပါ။",
    live: "DEMO SIGNAL",
    sample: "နမူနာ signal · NASA တိုက်ရိုက်ထုတ်လွှင့်မှု မဟုတ်ပါ",
    dataFrame: "EARTH DATA FRAME",
    global: "ကမ္ဘာလုံးဆိုင်ရာ မြင်ကွင်း",
    latest: "နောက်ဆုံးဖတ်ရှုချက်",
    anomaly: "ကမ္ဘာ့အပူချိန် ကွာဟချက်",
    ocean: "ပင်လယ်ရေမျက်နှာပြင်",
    forest: "သစ်တောအုပ်ဖုံးလွှမ်းမှု",
    temperature: "အပူချိန်",
    sound: "Sound studio",
    soundDesc: "ဤ signal ကို မည်သို့နားဆင်မည်ကို ချိန်ညှိပါ။",
    play: "Sonification ဖွင့်ရန်",
    pause: "Sonification ခဏရပ်ရန်",
    playing: "ယခုဖွင့်နေသည်",
    ready: "ဖွင့်ရန် အသင့်ဖြစ်ပါပြီ",
    pitch: "PITCH",
    pulse: "PULSE",
    low: "နိမ့်",
    high: "မြင့်",
    dataStory: "အချက်အလက်ကို အသံအဖြစ်",
    dataDesc:
      "တန်ဖိုးမြင့်လာလျှင် အသံ pitch မြင့်လာသည်။ ပြောင်းလဲမှုမြန်လျှင် rhythm ပိုမြန်လာသည်။ အရောင်ကလည်း အချက်အလက်ကို တစ်ချက်ကြည့်ရုံဖြင့် ပြသပေးသည်။",
    frequency: "ကြိမ်နှုန်း",
    tempo: "Pulse နှုန်း",
    source: "ဒေတာမှတ်ချက်",
    sourceDetail:
      "ဤ demo တွင် sonification ချိန်ညှိမှုများကို ပြသရန် ဖန်တီးထားသော signal ကို အသုံးပြုထားသည်။ သိပ္ပံဆိုင်ရာ တိုင်းတာချက်များအတွက် EIC dataset ကို ချိတ်ဆက်ပါ။",
    access: "အာရုံခံစားမှု တစ်မျိုးထက်ပို၍",
    accessDesc:
      "မြင်ရသော အချက်အလက်လမ်းကြောင်းကို ၎င်း၏အသံနှင့် တွဲဖက်ကြည့်ရှုနိုင်သလို၊ အသံဖြင့်သာလည်း လိုက်လံနားဆင်နိုင်သည်။",
    navStudio: "Studio",
    navSignals: "Signals",
    navAbout: "EIC အကြောင်း",
    language: "ဘာသာစကား",
    signalLabel: "SIGNAL ရွေးချယ်ပါ",
    tempShort: "အပူချိန်",
    oceanShort: "သမုဒ္ဒရာ",
    forestShort: "သစ်တော",
    trend: "၁၂ လတာ ပြောင်းလဲမှု",
  },
} as const;

const signalNames: Record<SignalKey, keyof typeof copy.en> = {
  temperature: "tempShort",
  ocean: "oceanShort",
  forest: "forestShort",
};

const observationNames: Record<SignalKey, keyof typeof copy.en> = {
  temperature: "anomaly",
  ocean: "ocean",
  forest: "forest",
};

function makeWave(phase: number, signal: SignalKey) {
  const points = Array.from({ length: 70 }, (_, index) => {
    const x = (index / 69) * 1000;
    const progress = index / 69;
    const rate = signal === "ocean" ? 3.1 : signal === "forest" ? 2.05 : 2.6;
    const base = Math.sin(progress * rate * Math.PI * 2 + phase) * 42;
    const detail = Math.sin(progress * rate * Math.PI * 5 + phase * 1.4) * 14;
    const drift = Math.sin(progress * Math.PI * 1.3 + phase * 0.2) * 28;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${(125 - base - detail - drift).toFixed(1)}`;
  });
  return points.join(" ");
}

export default function Page() {
  const [language, setLanguage] = useState<Language>("en");
  const [signal, setSignal] = useState<SignalKey>("temperature");
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const audioRef = useRef<{
    context: AudioContext;
    oscillator: OscillatorNode;
    gain: GainNode;
  } | null>(null);
  const t = copy[language];
  const current = signals[signal];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      phaseRef.current += 0.11;
      setPhase(phaseRef.current);
      const audio = audioRef.current;
      if (audio) {
        const value = Math.sin(phaseRef.current * 0.42) * 0.5 + 0.5;
        audio.oscillator.frequency.setTargetAtTime(
          current.frequency + value * 120,
          audio.context.currentTime,
          0.08,
        );
        audio.gain.gain.setTargetAtTime(
          0.018 + value * 0.025,
          audio.context.currentTime,
          0.07,
        );
      }
    }, 90);
    return () => window.clearInterval(timer);
  }, [playing, current]);

  useEffect(
    () => () => {
      audioRef.current?.oscillator.stop();
      void audioRef.current?.context.close();
    },
    [],
  );

  async function togglePlayback() {
    if (playing) {
      const audio = audioRef.current;
      if (audio) {
        audio.gain.gain.setTargetAtTime(0, audio.context.currentTime, 0.04);
        window.setTimeout(() => {
          audio.oscillator.stop();
          void audio.context.close();
          if (audioRef.current === audio) audioRef.current = null;
        }, 180);
      }
      setPlaying(false);
      return;
    }

    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = current.frequency;
      gain.gain.value = 0;
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      audioRef.current = { context, oscillator, gain };
      await context.resume();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  return (
    <main className="earth-app" lang={language}>
      <header className="topbar">
        <a className="brand" href="#studio" aria-label="Earth Beat home">
          <span className="brand-mark">
            <Waves size={19} strokeWidth={2.2} />
          </span>
          <span>
            earth<span className="brand-light">beat</span>
          </span>
        </a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <a className="nav-link active" href="#studio">
            <AudioLines size={15} />
            {t.navStudio}
          </a>
          <a className="nav-link" href="#signals">
            <Activity size={15} />
            {t.navSignals}
          </a>
          <a className="nav-link" href="#about">
            <Globe2 size={15} />
            {t.navAbout}
          </a>
        </nav>
        <div className="top-actions">
          <span className="availability">
            <span />
            {t.live}
          </span>
          <label className="language-select">
            <span className="sr-only">{t.language}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              aria-label={t.language}
            >
              <option value="en">EN</option>
              <option value="my">MY</option>
            </select>
          </label>
        </div>
      </header>

      <div className="page-shell" id="studio">
        <section className="intro-row">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="intro-copy">{t.subtitle}</p>
          </div>
          <div className="sample-badge">
            <span className="sample-dot" />
            {t.sample}
          </div>
        </section>

        <section className="studio-layout" aria-label={t.sound}>
          <div
            className="signal-stage"
            style={{ "--signal-color": current.color } as CSSProperties}
          >
            <div className="stage-topline">
              <span>
                <span className="stage-dot" />
                {t.dataFrame}
              </span>
              <span className="stage-location">
                <Globe2 size={14} />
                {t.global}
              </span>
            </div>
            <div className="planet-wrap" aria-hidden="true">
              <div className="planet-glow" />
              <div className="planet" />
              <div className="planet-orbit">
                <span />
              </div>
              <div className="orbit-readout">
                <span className="orbit-line" />
                {t.latest}
                <strong>
                  {signal === "temperature"
                    ? "+1.24°"
                    : signal === "ocean"
                      ? "+3.4 mm"
                      : "84.2%"}
                </strong>
              </div>
            </div>
            <div className="stage-caption">
              <div>
                <span className="caption-kicker">
                  NASA EARTH OBSERVATION · DEMO
                </span>
                <h2>{t[observationNames[signal]]}</h2>
              </div>
              <span className="frame-count">
                01 <span>/</span> 03
              </span>
            </div>
            <span className="stage-coordinate">30°N&nbsp; 45°E</span>
          </div>

          <div className="studio-console">
            <div className="console-heading">
              <div>
                <p className="eyebrow">{t.sound}</p>
                <h2>{t.soundDesc}</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="About sonification"
                title={t.dataStory}
              >
                <CircleHelp size={18} />
              </button>
            </div>

            <div className="signal-picker" id="signals">
              <p className="control-label">{t.signalLabel}</p>
              <div
                className="signal-options"
                role="group"
                aria-label={t.signalLabel}
              >
                {(["temperature", "ocean", "forest"] as SignalKey[]).map(
                  (key) => (
                    <button
                      key={key}
                      className={`signal-option ${signal === key ? "selected" : ""}`}
                      type="button"
                      onClick={() => setSignal(key)}
                      aria-pressed={signal === key}
                    >
                      <span className={`signal-swatch ${key}`} />
                      {t[signalNames[key]]}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="wave-panel" aria-label={`${t.trend} waveform`}>
              <div className="wave-top">
                <span>{t.trend}</span>
                <span className="wave-period">JAN — DEC</span>
              </div>
              <svg
                className="waveform"
                viewBox="0 0 1000 250"
                preserveAspectRatio="none"
                role="img"
                aria-label={`${t.trend} visualization`}
              >
                <defs>
                  <linearGradient id="wave-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={current.color}
                      stopOpacity=".2"
                    />
                    <stop
                      offset="100%"
                      stopColor={current.color}
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  className="wave-area"
                  d={`${makeWave(phase, signal)} L 1000 250 L 0 250 Z`}
                  fill="url(#wave-fill)"
                />
                <path
                  className="wave-path"
                  d={makeWave(phase, signal)}
                  fill="none"
                  stroke={current.color}
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  className="wave-cursor"
                  x1="690"
                  x2="690"
                  y1="8"
                  y2="242"
                />
                <circle
                  className="wave-point"
                  cx="690"
                  cy={125 - Math.sin(phase) * 34}
                  r="5"
                  fill={current.color}
                />
              </svg>
              <div className="wave-months">
                <span>JAN</span>
                <span>APR</span>
                <span>JUL</span>
                <span>OCT</span>
                <span>DEC</span>
              </div>
            </div>

            <div className="play-row">
              <button
                className={`play-button ${playing ? "is-playing" : ""}`}
                type="button"
                onClick={togglePlayback}
                aria-label={playing ? t.pause : t.play}
              >
                {playing ? (
                  <Pause size={17} fill="currentColor" />
                ) : (
                  <Play size={17} fill="currentColor" />
                )}
                <span>{playing ? t.pause : t.play}</span>
              </button>
              <span className={`play-status ${playing ? "on-air" : ""}`}>
                <span />
                {playing ? t.playing : t.ready}
              </span>
            </div>

            <div className="mapping-row">
              <div className="mapping-item">
                <span className="mapping-icon pitch-icon">
                  <ArrowUpRight size={16} />
                </span>
                <span>
                  {t.pitch}
                  <strong>
                    {Math.round(
                      current.frequency + Math.sin(phase * 0.42) * 60 + 60,
                    )}{" "}
                    Hz
                  </strong>
                </span>
              </div>
              <div className="mapping-divider" />
              <div className="mapping-item">
                <span className="mapping-icon pulse-icon">
                  <Radio size={15} />
                </span>
                <span>
                  {t.pulse}
                  <strong>{Math.round(48 + current.level * 15)} BPM</strong>
                </span>
              </div>
              <span className="mapping-range">
                {t.low}
                <span />
                <span />
                <span />
                <span />
                <span
                  className="range-active"
                  style={{ backgroundColor: current.color }}
                />
                {t.high}
              </span>
            </div>
          </div>
        </section>

        <section className="understage" id="about">
          <article className="story-block">
            <span className="section-index">01 / THE TRANSLATION</span>
            <h2>{t.dataStory}</h2>
            <p>{t.dataDesc}</p>
          </article>
          <article className="detail-block">
            <div className="detail-icon">
              <Headphones size={18} />
            </div>
            <div>
              <h3>{t.access}</h3>
              <p>{t.accessDesc}</p>
            </div>
            <ArrowDownRight className="detail-arrow" size={18} />
          </article>
          <article className="source-block">
            <span className="section-index">02 / {t.source}</span>
            <p>{t.sourceDetail}</p>
          </article>
        </section>
        <footer className="page-footer">
          <span>
            EARTH BEAT <span className="footer-separator">/</span> NASA EIC
            CHALLENGE DEMO
          </span>
          <span>DATA HAS A RHYTHM.</span>
        </footer>
      </div>
    </main>
  );
}
