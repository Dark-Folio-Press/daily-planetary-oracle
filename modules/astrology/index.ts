// Astrology Module - Exports for astrological calculations, charts, and transits
export { AstrologyService } from './services/astrology';

// Re-export astrology components
export { default as BirthChartGenerator } from './components/birth-chart-generator';
export { default as EnhancedVintageChart } from './components/enhanced-vintage-chart';
export { default as HousesChart } from './components/houses-chart';

// Types
export type {
  BirthInfo,
  BirthData,
  AstrologicalHouse,
  PlanetPosition,
  PlanetaryAspect,
  DetailedChart
} from './services/astrology';