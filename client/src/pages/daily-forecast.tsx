import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw, Star, Zap, AlertTriangle, Clock, Shield } from "lucide-react";

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

export default function DailyForecast() {
  const { data, isLoading, isFetching, refetch } = useQuery<ForecastResponse>({
    queryKey: ["/api/wix/horoscope/daily-forecast"],
    queryFn: async () => {
      const res = await fetch("/api/wix/horoscope/daily-forecast");
      if (!res.ok) throw new Error("Failed to fetch forecast");
      return res.json();
    },
    staleTime: 1000 * 60 * 30,
  });

  const forecast = data?.forecast;
  const planetPositions = data?.planetPositions || [];

  const formatDate = (d?: string) => {
    if (!d) return '';
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const dominantColor = ELEMENT_COLORS[forecast?.dominantElement || 'fire'];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden"
      style={{ fontFamily: "'Courier New', monospace" }}>
      <div className="max-w-3xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <button className="flex items-center gap-2 text-purple-400 hover:text-purple-200 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </Link>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2"
            style={{ background: "linear-gradient(45deg,#c084fc,#60a5fa,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🔮 Daily Astrological Forecast
          </h1>
          {data?.date && (
            <p className="text-sm text-gray-500 mt-1">{formatDate(data.date)}</p>
          )}
          {data?.source === 'swiss_ephemeris' && (
            <p className="text-xs text-green-600 mt-1">🟢 Live Swiss Ephemeris data</p>
          )}
          <p className="text-xs text-gray-600 mt-2">
            General astrological conditions based on today's planetary positions — not sign-specific
          </p>
          <div className="flex gap-3 justify-center mt-4 flex-wrap">
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
            <Link href="/daily-planetary-oracle">
              <button className="px-5 py-2.5 rounded-xl border border-indigo-800 text-indigo-300 hover:text-indigo-100 hover:border-indigo-600 transition-all text-sm">
                🎵 Hear the Planets
              </button>
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-20">
            <div className="text-purple-400 animate-pulse mb-3 text-4xl">🔮</div>
            <p className="text-purple-400 text-sm animate-pulse">The stars are being consulted...</p>
            <p className="text-gray-600 text-xs mt-2">Calculating real planetary positions via Swiss Ephemeris</p>
          </div>
        )}

        {forecast && !isLoading && (
          <>
            {forecast.cosmicWarning && (
              <div className="rounded-xl border border-orange-900/40 p-4 mb-4 flex gap-3"
                style={{ background: "rgba(20,10,0,0.8)" }}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-orange-600 mb-1">Cosmic Warning</p>
                  <p className="text-sm text-orange-200">{forecast.cosmicWarning}</p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-purple-900/40 p-6 mb-6 text-center"
              style={{ background: "rgba(10,5,20,0.95)", boxShadow: "0 0 40px rgba(168,85,247,0.12)" }}>
              <p className="text-xs uppercase tracking-widest text-gray-600 mb-3">Today's Cosmic Weather</p>
              <p className="text-sm text-gray-300 leading-relaxed max-w-2xl mx-auto">
                {forecast.overallInterpretation}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
              <div className="rounded-xl border p-3 mb-6 text-center text-sm"
                style={{ borderColor: `${dominantColor}44`, background: `${dominantColor}08`, color: dominantColor }}>
                {ELEMENT_ICONS[forecast.dominantElement]} {forecast.elementalMood}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xs uppercase tracking-widest text-gray-600 mb-3">
                Planetary Positions & Influences
              </h2>
              <div className="space-y-2">
                {planetPositions.map(pos => {
                  const planetForecast = forecast.planets?.find(p => p.name === pos.name);
                  return (
                    <PlanetCard key={pos.name} pos={pos} forecast={planetForecast} />
                  );
                })}
              </div>
            </div>

          </>
        )}

        <p className="text-center text-gray-700 mt-8 text-xs">
          Based on live planetary positions · Dark Folio Horoscopes · Updated daily at midnight
        </p>
      </div>
    </div>
  );
}
