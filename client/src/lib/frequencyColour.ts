export interface SpectralColour {
  wavelengthNm: number;
  r: number;
  g: number;
  b: number;
  hex: string;
  label: string;
}

export function frequencyToWavelength(hz: number): number {
  const VISIBLE_LOW_THz = 430;
  const VISIBLE_HIGH_THz = 750;
  let freqTHz = hz * 1e-12;
  while (freqTHz < VISIBLE_LOW_THz) freqTHz *= 2;
  while (freqTHz > VISIBLE_HIGH_THz) freqTHz /= 2;
  const wavelengthNm = 3e8 / (freqTHz * 1e12) * 1e9;
  return Math.round(wavelengthNm * 10) / 10;
}

export function wavelengthToRgb(nm: number): SpectralColour {
  let r = 0, g = 0, b = 0;

  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (nm >= 440 && nm < 490) {
    r = 0;
    g = (nm - 440) / (490 - 440);
    b = 1;
  } else if (nm >= 490 && nm < 510) {
    r = 0;
    g = 1;
    b = -(nm - 510) / (510 - 490);
  } else if (nm >= 510 && nm < 580) {
    r = (nm - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (nm >= 580 && nm < 645) {
    r = 1;
    g = -(nm - 645) / (645 - 580);
    b = 0;
  } else if (nm >= 645 && nm <= 780) {
    r = 1;
    g = 0;
    b = 0;
  }

  let factor = 1;
  if (nm >= 380 && nm < 420) factor = 0.3 + 0.7 * (nm - 380) / (420 - 380);
  else if (nm >= 700 && nm <= 780) factor = 0.3 + 0.7 * (780 - nm) / (780 - 700);

  const gamma = 0.8;
  const toInt = (c: number) => Math.round(255 * Math.pow(c * factor, gamma));
  const ri = toInt(r), gi = toInt(g), bi = toInt(b);
  const hex = `#${ri.toString(16).padStart(2, '0')}${gi.toString(16).padStart(2, '0')}${bi.toString(16).padStart(2, '0')}`;

  const label = getColourLabel(nm);

  return { wavelengthNm: nm, r: ri, g: gi, b: bi, hex, label };
}

function getColourLabel(nm: number): string {
  if (nm < 380) return 'Ultraviolet';
  if (nm < 420) return 'Violet';
  if (nm < 440) return 'Blue-Violet';
  if (nm < 460) return 'Indigo';
  if (nm < 490) return 'Blue';
  if (nm < 510) return 'Cyan-Blue';
  if (nm < 520) return 'Cyan-Green';
  if (nm < 560) return 'Green';
  if (nm < 570) return 'Yellow-Green';
  if (nm < 590) return 'Yellow';
  if (nm < 625) return 'Orange';
  if (nm < 660) return 'Red-Orange';
  if (nm < 700) return 'Red';
  return 'Deep Red';
}

export function getSpectralColour(hz: number): SpectralColour {
  const nm = frequencyToWavelength(hz);
  return wavelengthToRgb(nm);
}

export const TAROT_COLOUR_MAP: Record<string, string> = {
  'Yellow':       '#F5E642',
  'Blue':         '#4A90D9',
  'Green':        '#4CAF50',
  'Red':          '#E53935',
  'Orange':       '#FF8C00',
  'Red-Orange':   '#FF4500',
  'Orange-Yellow':'#FFC300',
  'Yellow-Green': '#9ACD32',
  'Blue-Violet':  '#6A0DAD',
  'Blue-Green':   '#00897B',
  'Violet':       '#8B00FF',
  'Indigo':       '#4B0082',
  'White':        '#F0F0F0',
  'Black':        '#222222',
  'Gold':         '#FFD700',
  'Silver':       '#C0C0C0',
};

export function tarotColourToHex(colour: string): string {
  return TAROT_COLOUR_MAP[colour] || '#888888';
}
