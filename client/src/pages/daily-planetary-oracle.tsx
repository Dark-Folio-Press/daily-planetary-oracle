import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Volume2, VolumeX, Square, Layers, AlertTriangle, Clock, Shield, RefreshCw, Star, Zap } from "lucide-react";
import tarotData from "@/data/tarot-correspondences.json";
import { getSpectralColour, tarotColourToHex } from "@/lib/frequencyColour";

interface PlanetAudio {
  baseFrequency: number;
  frequency: number;
  modulationRate: number;
  modulationDepth: number;
  waveform: OscillatorType;
  volume: number;
}

interface Planet {
  name: string;
  symbol: string;
  sign: string;
  degree: number;
  longitude: number;
  retrograde: boolean;
  element: string;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  audio: PlanetAudio;
}

interface PlanetsResponse {
  success: boolean;
  date: string;
  source: string;
  planets: Planet[];
}

interface ActiveSound {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  modulator: OscillatorNode;
  gain: GainNode;
  modGain: GainNode;
}

interface TarotRecord {
  planet: string;
  number: string;
  rwName: string;
  thothName: string;
  elemental: string;
  element: string;
  colour: string;
  astro: string;
  planets: string;
  signs: string;
  gemstone: string;
  runeName: string;
  runeMeaning: string;
  hebrewLetter: string;
  hebrewMeaning: string;
  numerologyKeys: string;
  keywords: string[];
  mythical: string;
}

interface PlanetPosition {
  name: string;
  symbol: string;
  sign: string;
  degree: number;
  retrograde: boolean;
  element: string;
  color: string;
  domain: string;
}

interface PlanetForecast {
  name: string;
  headline: string;
  interpretation: string;
  advice: string;
}

interface Forecast {
  overallTheme: string;
  overallInterpretation: string;
  planets: PlanetForecast[];
  dominantElement: string;
  elementalMood: string;
  luckyWindow: string;
  avoidWindow: string;
  dailyMantra: string;
  cosmicWarning: string;
}

interface ForecastResponse {
  success: boolean;
  date: string;
  source: string;
  planetPositions: PlanetPosition[];
  forecast: Forecast;
}

type Element = 'Air' | 'Water' | 'Earth' | 'Fire';

interface ElementPreset {
  label: string;
  icon: string;
  genre: string;
  filterType: BiquadFilterType;
  filterFreq: number;
  filterGain: number;
  distortion: number;
  description: string;
}

const ELEMENT_PRESETS: Record<Element, ElementPreset> = {
  Air: {
    label: 'Air',
    icon: '🌬️',
    genre: 'Pop Synth',
    filterType: 'highshelf',
    filterFreq: 3000,
    filterGain: 10,
    distortion: 0,
    description: 'Bright · Electronic · Sylph',
  },
  Water: {
    label: 'Water',
    icon: '💧',
    genre: 'Ambient',
    filterType: 'lowpass',
    filterFreq: 1800,
    filterGain: 0,
    distortion: 0,
    description: 'Smooth · Flowing · Undine',
  },
  Earth: {
    label: 'Earth',
    icon: '🌍',
    genre: 'Folk',
    filterType: 'bandpass',
    filterFreq: 700,
    filterGain: 0,
    distortion: 8,
    description: 'Warm · Grounded · Gnome',
  },
  Fire: {
    label: 'Fire',
    icon: '🔥',
    genre: 'Grunge',
    filterType: 'peaking',
    filterFreq: 1200,
    filterGain: 12,
    distortion: 50,
    description: 'Raw · Distorted · Salamander',
  },
};

const ELEMENTAL_TO_ELEMENT: Record<string, Element> = {
  Sylph: 'Air',
  Undine: 'Water',
  Gnome: 'Earth',
  Salamander: 'Fire',
};

const ORBIT_RADII_DISPLAY: Record<string, number> = {
  Sun: 0, Mercury: 55, Venus: 82, Moon: 108,
  Mars: 135, Jupiter: 165, Saturn: 200,
};

const ELEMENT_ICONS: Record<string, string> = {
  fire: '🔥', earth: '🌍', air: '🌬️', water: '💧'
};

const ELEMENT_COLORS: Record<string, string> = {
  fire: '#f97316', earth: '#86efac', air: '#60a5fa', water: '#22d3ee'
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☀️', Moon: '🌙', Mercury: '☿', Venus: '♀',
  Mars: '♂', Jupiter: '♃', Saturn: '♄'
};

function makeDistortionCurve(amount: number): Float32Array {
  const n = 256;
  const curve = new Float32Array(n);
  const k = amount;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function getPrimaryCard(planetName: string): TarotRecord | null {
  const all = (tarotData as TarotRecord[]).filter(r => r.planet === planetName);
  return all.find(r => r.gemstone) || all[0] || null;
}

function getMinorCards(planetName: string): TarotRecord[] {
  return (tarotData as TarotRecord[]).filter(r => r.planet === planetName && !r.gemstone);
}

function PlanetCard({ pos, forecast }: { pos: PlanetPosition; forecast?: PlanetForecast }) {
  const [expanded, setExpanded] = useState(false);
  const elemColor = ELEMENT_COLORS[pos.element] || '#a855f7';

  return (
    <div
      className="rounded-xl border transition-all duration-200 overflow-hidden"
      style={{
        borderColor: expanded ? pos.color : '#2a2a3a',
        background: expanded ? `${pos.color}08` : 'rgba(10,10,20,0.9)',
        boxShadow: expanded ? `0 0 20px ${pos.color}22` : 'none',
      }}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex flex-col items-center w-10 shrink-0">
          <span className="text-2xl">{PLANET_SYMBOLS[pos.name] || pos.symbol}</span>
          <span className="text-xs mt-0.5" style={{ color: pos.color }}>{pos.name}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">{pos.sign}</span>
            <span className="text-xs text-gray-500">{pos.degree}°</span>
            {pos.retrograde && (
              <span className="text-xs text-red-400 font-bold">℞ Retrograde</span>
            )}
            <span className="text-xs px-1.5 py-0.5 rounded-full border"
              style={{ borderColor: `${elemColor}55`, color: elemColor, background: `${elemColor}11` }}>
              {ELEMENT_ICONS[pos.element]} {pos.element}
            </span>
          </div>
          {forecast && (
            <p className="text-xs text-gray-400 mt-1 truncate">{forecast.headline}</p>
          )}
          <p className="text-xs text-gray-600 mt-0.5">{pos.domain}</p>
        </div>
        <span className="text-gray-600 text-sm shrink-0">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && forecast && (
        <div className="px-4 pb-4 border-t border-gray-800/60 pt-3 space-y-3">
          <p className="text-sm text-gray-300 leading-relaxed">{forecast.interpretation}</p>
          <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-800"
            style={{ background: `${pos.color}0a` }}>
            <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: pos.color }} />
            <p className="text-xs text-gray-300 leading-relaxed">{forecast.advice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DailyPlanetaryOracle() {
  const orreryRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const activeSoundsRef = useRef<Record<string, ActiveSound>>({});
  const animFrameRef = useRef<number>(0);
  const analyserFrameRef = useRef<number>(0);
  const orreryAngleRef = useRef<Record<string, number>>({});
  const starsRef = useRef<Array<{ x: number; y: number; r: number; speed: number }>>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const distortionNodeRef = useRef<WaveShaperNode | null>(null);

  const [activePlanets, setActivePlanets] = useState<Set<string>>(new Set());
  const [frequency, setFrequency] = useState(440);
  const [modRate, setModRate] = useState(5);
  const [modDepth, setModDepth] = useState(50);
  const [volume, setVolume] = useState(50);
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [activeElement, setActiveElement] = useState<Element>('Water');
  const [focusedPlanet, setFocusedPlanet] = useState<Planet | null>(null);
  const [showMinorCards, setShowMinorCards] = useState(false);
  const [introVisible, setIntroVisible] = useState(() => localStorage.getItem('oracle-intro-seen') !== 'true');
  const [introExpanded, setIntroExpanded] = useState(false);

  const dismissIntro = () => {
    localStorage.setItem('oracle-intro-seen', 'true');
    setIntroVisible(false);
  };

  const { data, isLoading } = useQuery<PlanetsResponse>({
    queryKey: ["/api/wix/horoscope/planets/sounds"],
    queryFn: async () => {
      const res = await fetch("/api/wix/horoscope/planets/sounds");
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  const { data: forecastData, isLoading: forecastLoading, isFetching: forecastFetching, refetch: refetchForecast } =
    useQuery<ForecastResponse>({
      queryKey: ["/api/wix/horoscope/daily-forecast"],
      queryFn: async () => {
        const res = await fetch("/api/wix/horoscope/daily-forecast");
        if (!res.ok) throw new Error("Failed to fetch forecast");
        return res.json();
      },
      staleTime: 1000 * 60 * 30,
    });

  const forecast = forecastData?.forecast;
  const planetPositions = forecastData?.planetPositions || [];

  const formatDate = (d?: string) => {
    if (!d) return '';
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const planets = data?.planets || [];

  const applyElementPreset = useCallback((element: Element) => {
    if (!filterNodeRef.current || !distortionNodeRef.current) return;
    const preset = ELEMENT_PRESETS[element];
    filterNodeRef.current.type = preset.filterType;
    filterNodeRef.current.frequency.value = preset.filterFreq;
    filterNodeRef.current.gain.value = preset.filterGain;
    if (preset.distortion > 0) {
      distortionNodeRef.current.curve = makeDistortionCurve(preset.distortion);
      distortionNodeRef.current.oversample = '4x';
    } else {
      distortionNodeRef.current.curve = makeDistortionCurve(0);
    }
  }, []);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserNodeRef.current = audioCtxRef.current.createAnalyser();
      analyserNodeRef.current.fftSize = 2048;

      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = volume / 100;

      filterNodeRef.current = audioCtxRef.current.createBiquadFilter();
      distortionNodeRef.current = audioCtxRef.current.createWaveShaper();

      filterNodeRef.current.connect(distortionNodeRef.current);
      distortionNodeRef.current.connect(masterGainRef.current);
      masterGainRef.current.connect(analyserNodeRef.current);
      analyserNodeRef.current.connect(audioCtxRef.current.destination);

      applyElementPreset(activeElement);
    }
    return audioCtxRef.current;
  }, [volume, activeElement, applyElementPreset]);

  const handleElementChange = useCallback((element: Element) => {
    setActiveElement(element);
    if (audioCtxRef.current) {
      applyElementPreset(element);
    }
  }, [applyElementPreset]);

  const startPlanetSound = useCallback((planet: Planet) => {
    const ctx = initAudio();
    if (activeSoundsRef.current[planet.name]) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const gain = ctx.createGain();
    const modGain = ctx.createGain();

    osc1.type = planet.audio.waveform;
    osc2.type = "sine";
    modulator.type = "sine";

    const freq = planet.audio.frequency;
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.005;
    modulator.frequency.value = planet.audio.modulationRate;
    modGain.gain.value = planet.audio.modulationDepth * 8;
    gain.gain.value = 0.25 / Math.max(1, Object.keys(activeSoundsRef.current).length + 1);

    modulator.connect(modGain);
    modGain.connect(osc1.frequency);
    modGain.connect(osc2.frequency);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(filterNodeRef.current!);

    osc1.start();
    osc2.start();
    modulator.start();

    activeSoundsRef.current[planet.name] = { osc1, osc2, modulator, gain, modGain };

    setFrequency(Math.round(freq));
    setModRate(Math.round(planet.audio.modulationRate * 10) / 10);
    setModDepth(planet.audio.modulationDepth);
  }, [initAudio]);

  const stopPlanetSound = useCallback((planetName: string) => {
    const sound = activeSoundsRef.current[planetName];
    if (!sound) return;
    try {
      sound.osc1.stop();
      sound.osc2.stop();
      sound.modulator.stop();
    } catch {}
    delete activeSoundsRef.current[planetName];
  }, []);

  const togglePlanet = useCallback((planet: Planet) => {
    setActivePlanets(prev => {
      const next = new Set(prev);
      if (next.has(planet.name)) {
        next.delete(planet.name);
        stopPlanetSound(planet.name);
        setFocusedPlanet(fp => fp?.name === planet.name ? null : fp);
      } else {
        next.add(planet.name);
        startPlanetSound(planet);
        setFocusedPlanet(planet);
        const card = getPrimaryCard(planet.name);
        if (card?.elemental) {
          const elem = ELEMENTAL_TO_ELEMENT[card.elemental];
          if (elem) handleElementChange(elem);
        }
      }
      return next;
    });
  }, [startPlanetSound, stopPlanetSound, handleElementChange]);

  const playAll = useCallback(() => {
    const allActive = planets.every(p => activePlanets.has(p.name));
    if (allActive) {
      planets.forEach(p => stopPlanetSound(p.name));
      setActivePlanets(new Set());
      setFocusedPlanet(null);
    } else {
      planets.forEach(p => {
        if (!activePlanets.has(p.name)) startPlanetSound(p);
      });
      setActivePlanets(new Set(planets.map(p => p.name)));
    }
  }, [planets, activePlanets, startPlanetSound, stopPlanetSound]);

  const stopAll = useCallback(() => {
    planets.forEach(p => stopPlanetSound(p.name));
    setActivePlanets(new Set());
    setFocusedPlanet(null);
  }, [planets, stopPlanetSound]);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (!planets.length) return;
    planets.forEach(p => {
      if (!(p.name in orreryAngleRef.current)) {
        const longi = ((p.longitude ?? 0) / 360) * (2 * Math.PI);
        orreryAngleRef.current[p.name] = longi;
      }
    });
  }, [planets]);

  useEffect(() => {
    const canvas = orreryRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    if (!starsRef.current.length) {
      for (let i = 0; i < 180; i++) {
        starsRef.current.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.4, speed: Math.random() * 0.15 + 0.05
        });
      }
    }

    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, W, H);

      starsRef.current.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.4})`;
        ctx.fill();
        s.y += s.speed;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      });

      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      const sunGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
      sunGlow.addColorStop(0, "#FFF7A0");
      sunGlow.addColorStop(0.5, "#FFD700");
      sunGlow.addColorStop(1, "rgba(255,150,0,0)");
      ctx.fillStyle = sunGlow;
      ctx.fill();

      if (activePlanets.has("Sun")) {
        ctx.beginPath();
        ctx.arc(cx, cy, 26 + Math.sin(now / 200) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,215,0,0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      planets.filter(p => p.name !== "Sun").forEach(planet => {
        const r = ORBIT_RADII_DISPLAY[planet.name] || planet.orbitRadius;

        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.38, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();

        const speedFactor = planet.orbitSpeed * 0.04;
        const dir = planet.retrograde ? -1 : 1;
        orreryAngleRef.current[planet.name] = (orreryAngleRef.current[planet.name] || 0) + dir * speedFactor * dt;
        const angle = orreryAngleRef.current[planet.name] || 0;

        const px = cx + r * Math.cos(angle);
        const py = cy + r * 0.38 * Math.sin(angle);

        const isActive = activePlanets.has(planet.name);
        const isFocused = focusedPlanet?.name === planet.name;

        if (isActive) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = isFocused ? `${planet.color}66` : `${planet.color}22`;
          ctx.lineWidth = isFocused ? 2 : 1;
          ctx.stroke();

          const glowR = 14 + Math.sin(now / (1000 / planet.audio.modulationRate)) * 4;
          const glow = ctx.createRadialGradient(px, py, 1, px, py, glowR);
          glow.addColorStop(0, planet.color);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(px, py, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, isActive ? 8 : 5, 0, Math.PI * 2);
        ctx.fillStyle = planet.color;
        ctx.fill();

        if (planet.retrograde) {
          ctx.font = "9px monospace";
          ctx.fillStyle = "#FF8888";
          ctx.fillText("℞", px + 8, py - 6);
        }

        ctx.font = "10px monospace";
        ctx.fillStyle = isActive ? planet.color : "rgba(255,255,255,0.5)";
        ctx.fillText(planet.name, px + 10, py + 4);
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [planets, activePlanets, focusedPlanet]);

  useEffect(() => {
    const canvas = analyserRef.current;
    if (!canvas || !analyserNodeRef.current) return;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyserNodeRef.current.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyserFrameRef.current = requestAnimationFrame(draw);
      if (!analyserNodeRef.current) return;
      analyserNodeRef.current.getByteTimeDomainData(dataArray);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#a855f7";
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
    return () => cancelAnimationFrame(analyserFrameRef.current);
  }, [activePlanets]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      cancelAnimationFrame(analyserFrameRef.current);
      Object.keys(activeSoundsRef.current).forEach(stopPlanetSound);
    };
  }, [stopPlanetSound]);

  const focusedCard = focusedPlanet ? getPrimaryCard(focusedPlanet.name) : null;
  const minorCards = focusedPlanet ? getMinorCards(focusedPlanet.name) : [];
  const spectralColour = focusedPlanet ? getSpectralColour(focusedPlanet.audio.frequency) : null;
  const tarotHex = focusedCard ? tarotColourToHex(focusedCard.colour) : null;
  const dominantColor = ELEMENT_COLORS[forecast?.dominantElement || 'fire'];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" style={{ fontFamily: "'Courier New', monospace" }}>
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-purple-400 hover:text-purple-200 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-center"
            style={{ background: "linear-gradient(45deg,#c084fc,#60a5fa,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ✨ DAILY PLANETARY ORACLE ✨
          </h1>
          <button
            onClick={() => refetchForecast()}
            disabled={forecastFetching}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-xs w-20 justify-end"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${forecastFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Subtitle + date */}
        <p className="text-center text-gray-400 mb-1 text-sm">
          Hear the planets — powered by live astronomical transit data
          {data && <span className="ml-2 text-purple-500">· {data.date}</span>}
        </p>
        {forecastData?.date && (
          <p className="text-center text-sm text-gray-500 mb-1">{formatDate(forecastData.date)}</p>
        )}
        {forecastData?.source === 'swiss_ephemeris' && (
          <p className="text-center text-xs text-green-600 mb-3">🟢 Live Swiss Ephemeris data</p>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3 justify-center mb-6 flex-wrap">
          <a
            href="https://horoscopes.darkfoliopress.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl border border-purple-700 text-purple-300 hover:text-purple-100 hover:border-purple-500 transition-all text-sm"
          >
            Get Daily Horoscope by Sign
          </a>
          <a
            href="https://horoscopes.darkfoliopress.com/personal"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}
          >
            Get Personalized Horoscope
          </a>
        </div>

        {/* Intro panel */}
        {introVisible && (
          <div className="mb-6 rounded-xl border border-purple-900/50 bg-gray-950/80 p-5">
            <p className="text-xs uppercase tracking-widest text-purple-500 mb-2">How to consult this oracle</p>

            <p className="text-sm text-gray-300 leading-relaxed">
              Click any planet card to hear its orbital frequency and open its full symbolic correspondence — a reading drawn from today's actual sky positions. Each planet generates its own layer.
            </p>

            <button
              onClick={() => setIntroExpanded(v => !v)}
              className="mt-2 text-xs text-purple-500 hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              {introExpanded ? '▾ Read less' : '▸ Read more — what each layer contains'}
            </button>

            {introExpanded && (
              <div className="mt-4 space-y-2 text-xs text-gray-400 border-t border-gray-800/60 pt-4">
                <div><span className="text-gray-200 font-semibold">Colour Correspondences —</span> Three swatches: the planet's spectral colour derived from its Kepler frequency transposed into visible light; the traditional tarot colour; and the astrological planetary colour. Plus a gradient showing all three in sequence.</div>
                <div><span className="text-gray-200 font-semibold">Gemstone —</span> The stone associated with this planet in western occult tradition.</div>
                <div><span className="text-gray-200 font-semibold">Elder Futhark Rune —</span> The runic symbol assigned to this planet and its core meaning.</div>
                <div><span className="text-gray-200 font-semibold">Hebrew Letter —</span> The Kabbalistic letter correspondence and its translation.</div>
                <div><span className="text-gray-200 font-semibold">Keywords —</span> The planet's operating principles in plain language.</div>
                <div><span className="text-gray-200 font-semibold">Mythical / Spiritual —</span> The god, archetype, or myth that defines this planet's character.</div>
                <div><span className="text-gray-200 font-semibold">Minor Arcana Spread —</span> The tarot cards that resonate with this planet's energy — a celestial spread drawn from today's active planetary positions. Expand it below the main card.</div>
                <div><span className="text-gray-200 font-semibold">Today's Reading —</span> GPT-4o forecast for this planet based on its actual position in the sky right now. Includes a headline, interpretation, and specific advice.</div>
              </div>
            )}

            <button
              onClick={dismissIntro}
              className="mt-4 px-4 py-2 text-xs rounded-lg border border-purple-700 text-purple-400 hover:text-white hover:border-purple-400 transition-colors"
            >
              Got it — open the oracle
            </button>
          </div>
        )}

        {/* Re-show intro link (shown after dismissal) */}
        {!introVisible && (
          <button
            onClick={() => { setIntroVisible(true); setIntroExpanded(false); }}
            className="block mx-auto mb-4 text-xs text-gray-600 hover:text-purple-400 transition-colors"
          >
            ▸ How does this oracle work?
          </button>
        )}

        {/* Forecast Overview */}
        {forecastLoading && !forecast && (
          <div className="text-center py-8 mb-4">
            <p className="text-purple-400 text-sm animate-pulse">The stars are being consulted...</p>
            <p className="text-gray-600 text-xs mt-2">Calculating real planetary positions via Swiss Ephemeris</p>
          </div>
        )}
        {forecast && (
          <div className="mb-6 space-y-4">
            {forecast.cosmicWarning && (
              <div className="rounded-xl border border-orange-900/40 p-4 flex gap-3"
                style={{ background: "rgba(20,10,0,0.8)" }}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-orange-600 mb-1">Cosmic Warning</p>
                  <p className="text-sm text-orange-200">{forecast.cosmicWarning}</p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-purple-900/40 p-6 text-center"
              style={{ background: "rgba(10,5,20,0.95)", boxShadow: "0 0 40px rgba(168,85,247,0.12)" }}>
              <p className="text-xs uppercase tracking-widest text-gray-600 mb-3">Today's Cosmic Weather</p>
              <p className="text-sm text-gray-300 leading-relaxed max-w-2xl mx-auto">{forecast.overallInterpretation}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-gray-800 p-3 bg-gray-950/60 text-center">
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Element</p>
                <p className="text-lg">{ELEMENT_ICONS[forecast.dominantElement]}</p>
                <p className="text-xs font-bold capitalize mt-1" style={{ color: dominantColor }}>
                  {forecast.dominantElement}
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 p-3 bg-gray-950/60 text-center">
                <Clock className="w-4 h-4 mx-auto mb-1 text-green-500" />
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Best Window</p>
                <p className="text-xs text-green-400 font-bold">{forecast.luckyWindow}</p>
              </div>
              <div className="rounded-xl border border-gray-800 p-3 bg-gray-950/60 text-center">
                <Shield className="w-4 h-4 mx-auto mb-1 text-red-500" />
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Avoid</p>
                <p className="text-xs text-red-400 font-bold">{forecast.avoidWindow}</p>
              </div>
              <div className="rounded-xl border border-gray-800 p-3 bg-gray-950/60 text-center">
                <Star className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Mantra</p>
                <p className="text-xs text-purple-300 italic leading-tight">"{forecast.dailyMantra}"</p>
              </div>
            </div>

            {forecast.elementalMood && (
              <div className="rounded-xl border p-3 text-center text-sm"
                style={{ borderColor: `${dominantColor}44`, background: `${dominantColor}08`, color: dominantColor }}>
                {ELEMENT_ICONS[forecast.dominantElement]} {forecast.elementalMood}
              </div>
            )}
          </div>
        )}

        {/* Orrery canvas */}
        <canvas ref={orreryRef} width={900} height={320}
          className="w-full rounded-xl border border-purple-900/40 mb-6"
          style={{ background: "#000", boxShadow: "0 0 40px rgba(168,85,247,0.15)" }} />

        {isLoading ? (
          <div className="text-center text-purple-400 py-8 animate-pulse">Consulting the heavens...</div>
        ) : (
          <>
            {/* Planet buttons */}
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-4">
              {planets.map(planet => {
                const isActive = activePlanets.has(planet.name);
                const isFocused = focusedPlanet?.name === planet.name;
                const card = getPrimaryCard(planet.name);
                const spectral = getSpectralColour(planet.audio.frequency);
                return (
                  <button
                    key={planet.name}
                    onClick={() => togglePlanet(planet)}
                    onMouseEnter={() => setHoveredPlanet(planet)}
                    onMouseLeave={() => setHoveredPlanet(null)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200"
                    style={{
                      borderColor: isActive ? planet.color : isFocused ? planet.color : "#333",
                      background: isActive ? `${planet.color}18` : "rgba(20,20,40,0.9)",
                      boxShadow: isActive ? `0 0 20px ${planet.color}44` : "none",
                      transform: isActive ? "translateY(-2px)" : "none",
                      outline: isFocused && isActive ? `2px solid ${planet.color}88` : "none",
                    }}
                  >
                    <span className="text-2xl">{planet.symbol}</span>
                    <span className="text-xs font-bold" style={{ color: isActive ? planet.color : "#aaa" }}>
                      {planet.name}
                    </span>
                    <span className="text-xs text-gray-500">{planet.sign}</span>
                    {planet.retrograde && <span className="text-xs text-red-400">℞</span>}
                    <div className="flex gap-1 mt-1">
                      <div
                        title={`${spectral.label} · ${spectral.wavelengthNm}nm`}
                        className="w-2 h-2 rounded-full border border-black/30"
                        style={{ background: spectral.hex }}
                      />
                      {card && (
                        <div
                          title={`Tarot: ${card.colour}`}
                          className="w-2 h-2 rounded-full border border-black/30"
                          style={{ background: tarotColourToHex(card.colour) }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Playback controls */}
            <div className="flex gap-3 justify-center mb-4 flex-wrap">
              <button
                onClick={playAll}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)"
                }}
              >
                <Layers className="w-4 h-4" />
                {planets.every(p => activePlanets.has(p.name)) ? "Stop All" : "🪐 Play All 7"}
              </button>
              <button
                onClick={stopAll}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
              >
                <Square className="w-4 h-4" /> Silence
              </button>
              <button
                onClick={() => setIsMuted(m => !m)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {hoveredPlanet && !activePlanets.has(hoveredPlanet.name) && (
              <div className="text-center mb-3 text-sm" style={{ color: hoveredPlanet.color }}>
                {hoveredPlanet.symbol} {hoveredPlanet.name} · {hoveredPlanet.sign} {hoveredPlanet.degree}°
                {hoveredPlanet.retrograde ? " · ℞" : ""} · {hoveredPlanet.audio.frequency.toFixed(1)} Hz
              </div>
            )}

            {/* Elemental filter */}
            <div className="mb-4 p-3 rounded-xl border border-gray-800 bg-gray-950/60">
              <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-3">
                Elemental Filter · auto-sets when a planet activates
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(Object.entries(ELEMENT_PRESETS) as [Element, ElementPreset][]).map(([elem, preset]) => {
                  const isActive = activeElement === elem;
                  const elementColors: Record<Element, string> = {
                    Air: '#60a5fa', Water: '#22d3ee', Earth: '#86efac', Fire: '#f97316'
                  };
                  const col = elementColors[elem];
                  return (
                    <button
                      key={elem}
                      onClick={() => handleElementChange(elem)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 text-center"
                      style={{
                        borderColor: isActive ? col : '#333',
                        background: isActive ? `${col}18` : 'rgba(10,10,20,0.9)',
                        boxShadow: isActive ? `0 0 14px ${col}44` : 'none',
                      }}
                    >
                      <span className="text-lg">{preset.icon}</span>
                      <span className="text-xs font-bold" style={{ color: isActive ? col : '#888' }}>
                        {preset.label}
                      </span>
                      <span className="text-xs" style={{ color: isActive ? col : '#555' }}>
                        {preset.genre}
                      </span>
                    </button>
                  );
                })}
              </div>
              {activeElement && (
                <p className="text-center text-xs mt-2" style={{
                  color: { Air: '#60a5fa', Water: '#22d3ee', Earth: '#86efac', Fire: '#f97316' }[activeElement]
                }}>
                  {ELEMENT_PRESETS[activeElement].icon} {ELEMENT_PRESETS[activeElement].description}
                </p>
              )}
            </div>

            {/* Merged symbolic + forecast panel */}
            {focusedPlanet && focusedCard && activePlanets.has(focusedPlanet.name) && (
              <div className="mb-4 rounded-xl border border-purple-900/40 overflow-hidden"
                style={{ background: "rgba(10,5,20,0.95)", boxShadow: `0 0 30px ${focusedPlanet.color}22` }}>
                <div className="px-5 py-4 border-b border-gray-800/60">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-gray-500">Symbolic Layer</span>
                      <h2 className="text-xl font-bold mt-0.5" style={{ color: focusedPlanet.color }}>
                        {focusedPlanet.symbol} {focusedCard.rwName}
                        {focusedCard.thothName && focusedCard.thothName !== focusedCard.rwName && (
                          <span className="text-gray-500 font-normal text-sm ml-2">/ {focusedCard.thothName}</span>
                        )}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{focusedCard.elemental}</span>
                      <span>·</span>
                      <span>{focusedCard.element}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* Colour correspondences */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-600 mb-2">Colour Correspondences</p>
                    <div className="flex gap-3 flex-wrap">
                      {spectralColour && (
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-12 h-12 rounded-lg border border-gray-700"
                            style={{
                              background: spectralColour.hex,
                              boxShadow: `0 0 12px ${spectralColour.hex}88`
                            }}
                          />
                          <span className="text-xs text-gray-400 text-center leading-tight">
                            {spectralColour.wavelengthNm}nm<br />
                            <span style={{ color: spectralColour.hex }}>{spectralColour.label}</span>
                          </span>
                          <span className="text-xs text-gray-600">Spectral</span>
                        </div>
                      )}
                      {tarotHex && (
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-12 h-12 rounded-lg border border-gray-700"
                            style={{
                              background: tarotHex,
                              boxShadow: `0 0 12px ${tarotHex}88`
                            }}
                          />
                          <span className="text-xs text-center leading-tight" style={{ color: tarotHex }}>
                            {focusedCard.colour}
                          </span>
                          <span className="text-xs text-gray-600">Tarot</span>
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-12 h-12 rounded-lg border border-gray-700"
                          style={{
                            background: focusedPlanet.color,
                            boxShadow: `0 0 12px ${focusedPlanet.color}88`
                          }}
                        />
                        <span className="text-xs text-center leading-tight" style={{ color: focusedPlanet.color }}>
                          Planetary
                        </span>
                        <span className="text-xs text-gray-600">Astrological</span>
                      </div>
                      <div className="flex-1 min-w-32 flex flex-col justify-center">
                        <div className="h-6 rounded-lg" style={{
                          background: spectralColour
                            ? `linear-gradient(to right, ${focusedPlanet.color}, ${tarotHex || '#888'}, ${spectralColour.hex})`
                            : focusedPlanet.color
                        }} />
                        <p className="text-xs text-gray-600 mt-1 text-center">Planetary → Tarot → Spectral</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {focusedCard.gemstone && (
                        <div>
                          <span className="text-xs uppercase tracking-widest text-gray-600">Gemstone</span>
                          <p className="text-sm mt-0.5" style={{ color: focusedPlanet.color }}>
                            💎 {focusedCard.gemstone}
                          </p>
                        </div>
                      )}
                      {focusedCard.runeName && (
                        <div>
                          <span className="text-xs uppercase tracking-widest text-gray-600">Rune</span>
                          <p className="text-sm mt-0.5 text-gray-300">
                            <span className="font-bold text-white">{focusedCard.runeName}</span>
                            {focusedCard.runeMeaning && (
                              <span className="text-gray-500"> · {focusedCard.runeMeaning}</span>
                            )}
                          </p>
                        </div>
                      )}
                      {focusedCard.hebrewLetter && (
                        <div>
                          <span className="text-xs uppercase tracking-widest text-gray-600">Hebrew</span>
                          <p className="text-sm mt-0.5 text-gray-300">
                            <span className="font-bold text-white text-lg">{focusedCard.hebrewLetter}</span>
                            {focusedCard.hebrewMeaning && (
                              <span className="text-gray-500 text-xs ml-2">"{focusedCard.hebrewMeaning}"</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {focusedCard.keywords.length > 0 && (
                        <div>
                          <span className="text-xs uppercase tracking-widest text-gray-600">Keywords</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {focusedCard.keywords.map((kw, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full text-xs border"
                                style={{ borderColor: `${focusedPlanet.color}55`, color: focusedPlanet.color, background: `${focusedPlanet.color}11` }}>
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {focusedCard.numerologyKeys && (
                        <div>
                          <span className="text-xs uppercase tracking-widest text-gray-600">Numerology</span>
                          <p className="text-xs text-gray-400 mt-0.5">{focusedCard.numerologyKeys}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {focusedCard.mythical && (
                    <div className="border-t border-gray-800/60 pt-3">
                      <span className="text-xs uppercase tracking-widest text-gray-600">Mythical / Spiritual</span>
                      <p className="text-xs text-gray-400 italic mt-1 leading-relaxed">{focusedCard.mythical}</p>
                    </div>
                  )}

                  {minorCards.length > 0 && (
                    <div className="border-t border-gray-800/60 pt-3">
                      <button
                        onClick={() => setShowMinorCards(v => !v)}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
                      >
                        <span>{showMinorCards ? '▾' : '▸'}</span>
                        Also resonates with {minorCards.length} minor arcana
                      </button>
                      {showMinorCards && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {minorCards.map((mc, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg text-xs border border-gray-700 text-gray-400">
                              {mc.rwName} · {mc.signs || mc.astro}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Today's forecast reading for this planet */}
                  {(() => {
                    const pf = forecast?.planets?.find(p => p.name === focusedPlanet.name);
                    return pf ? (
                      <div className="border-t border-gray-800/60 pt-3 space-y-2">
                        <p className="text-xs uppercase tracking-widest text-gray-600">Today's Reading</p>
                        <p className="text-sm font-semibold" style={{ color: focusedPlanet.color }}>{pf.headline}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{pf.interpretation}</p>
                        <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-800"
                          style={{ background: `${focusedPlanet.color}0a` }}>
                          <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: focusedPlanet.color }} />
                          <p className="text-xs text-gray-300 leading-relaxed">{pf.advice}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            )}
          </>
        )}

        {/* Manual Controls */}
        <div className="bg-gray-950 rounded-xl border border-gray-800 p-6 mt-2">
          <h3 className="text-center text-cyan-400 mb-5 text-sm tracking-widest uppercase">Manual Controls</h3>
          <div className="space-y-4">
            {[
              { label: "Frequency", id: "freq", min: 20, max: 2000, value: frequency, unit: " Hz", onChange: (v: number) => {
                setFrequency(v);
                Object.values(activeSoundsRef.current).forEach(s => {
                  s.osc1.frequency.value = v;
                  s.osc2.frequency.value = v * 1.005;
                });
              }},
              { label: "Modulation Rate", id: "modRate", min: 0, max: 20, value: modRate, unit: " Hz", step: "0.1", onChange: (v: number) => {
                setModRate(v);
                Object.values(activeSoundsRef.current).forEach(s => s.modulator.frequency.value = v);
              }},
              { label: "Modulation Depth", id: "modDepth", min: 0, max: 100, value: modDepth, unit: "%", onChange: (v: number) => {
                setModDepth(v);
                Object.values(activeSoundsRef.current).forEach(s => s.modGain.gain.value = v * 8);
              }},
              { label: "Volume", id: "vol", min: 0, max: 100, value: volume, unit: "%", onChange: (v: number) => {
                setVolume(v);
                if (masterGainRef.current) masterGainRef.current.gain.value = isMuted ? 0 : v / 100;
              }},
            ].map(ctrl => (
              <div key={ctrl.id}>
                <label className="flex justify-between text-xs text-gray-400 uppercase tracking-widest mb-2">
                  <span>{ctrl.label}</span>
                  <span className="text-cyan-400 font-bold">{ctrl.value}{ctrl.unit}</span>
                </label>
                <input type="range" min={ctrl.min} max={ctrl.max}
                  step={(ctrl as any).step || "1"}
                  value={ctrl.value}
                  onChange={e => ctrl.onChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #a855f7 ${((ctrl.value - ctrl.min) / (ctrl.max - ctrl.min)) * 100}%, #333 0%)` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Waveform analyser */}
        <canvas ref={analyserRef} width={900} height={60}
          className="w-full rounded-lg mt-4 border border-purple-900/20"
          style={{ background: "#000" }} />

        {/* Full Planetary Readings */}
        {planetPositions.length > 0 && forecast && (
          <div className="mt-6">
            <h2 className="text-xs uppercase tracking-widest text-gray-600 mb-3">Full Planetary Readings</h2>
            <div className="space-y-2">
              {planetPositions.map(pos => {
                const planetForecast = forecast.planets?.find(p => p.name === pos.name);
                return <PlanetCard key={pos.name} pos={pos} forecast={planetForecast} />;
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6 text-xs">
          Kepler frequencies · Swiss Ephemeris · FM synthesis · Tarot correspondences · GPT-4o forecast · {data?.source === 'swiss_ephemeris' ? '🟢 Live ephemeris' : '🟡 Calculated positions'}
        </p>
      </div>
    </div>
  );
}
