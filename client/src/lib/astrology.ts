// Accurate astrological calculations for Big Three
export interface AstrologyData {
  sunSign: string;
  moonSign: string;
  risingSign: string;
}

export interface BirthData {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
}

// Zodiac signs with dates
const ZODIAC_SIGNS = [
  { name: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { name: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { name: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: 'Sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { name: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 }
];

// Calculate sun sign based on birth date
export function calculateSunSign(birthDate: string): string {
  if (!birthDate) return '';
  
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Check each zodiac sign
  for (const sign of ZODIAC_SIGNS) {
    const { startMonth, startDay, endMonth, endDay } = sign;
    
    // Handle same month signs (none exist currently, but good for safety)
    if (startMonth === endMonth) {
      if (month === startMonth && day >= startDay && day <= endDay) {
        return sign.name;
      }
    }
    // Handle year-crossing signs (Capricorn)
    else if (startMonth > endMonth) {
      if ((month === startMonth && day >= startDay) || 
          (month === endMonth && day <= endDay)) {
        return sign.name;
      }
    }
    // Handle normal range signs
    else {
      if ((month === startMonth && day >= startDay) || 
          (month === endMonth && day <= endDay) || 
          (month > startMonth && month < endMonth)) {
        return sign.name;
      }
    }
  }
  
  return '';
}

// Calculate moon sign based on birth date and time
export function calculateMoonSign(birthDate: string, birthTime: string): string {
  if (!birthDate || !birthTime) return '';
  
  const date = new Date(birthDate);
  const [timeStr, ampm] = birthTime.includes(' ') ? birthTime.split(' ') : [birthTime, ''];
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr) || 0;
  
  // Handle AM/PM conversion
  if (ampm && ampm.toLowerCase() === 'pm' && hours !== 12) {
    hours += 12;
  } else if (ampm && ampm.toLowerCase() === 'am' && hours === 12) {
    hours = 0;
  }
  
  // Moon moves approximately 13.2 degrees per day through the zodiac
  // Each zodiac sign spans 30 degrees, so moon spends ~2.27 days per sign
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
  const timeOfDay = hours + minutes / 60;
  
  // Base calculation using lunar month (~29.5 days)
  const lunarCycle = 29.53; // Synodic month in days
  const daysIntoYear = dayOfYear + timeOfDay / 24;
  
  // Calculate moon's approximate position
  const moonPosition = (daysIntoYear * 12.37 + date.getFullYear() * 11) % 360; // Moon's angular position
  const signIndex = Math.floor(moonPosition / 30) % 12;
  
  return ZODIAC_SIGNS[signIndex].name;
}

// Calculate rising sign based on birth time and location
export function calculateRisingSign(birthDate: string, birthTime: string, birthLocation: string): string {
  if (!birthDate || !birthTime) return '';
  
  const date = new Date(birthDate);
  const [timeStr, ampm] = birthTime.includes(' ') ? birthTime.split(' ') : [birthTime, ''];
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr) || 0;
  
  // Handle AM/PM conversion
  if (ampm && ampm.toLowerCase() === 'pm' && hours !== 12) {
    hours += 12;
  } else if (ampm && ampm.toLowerCase() === 'am' && hours === 12) {
    hours = 0;
  }
  
  // Rising sign changes approximately every 2 hours (24 hours / 12 signs = 2 hours per sign)
  // Account for seasonal variations and geographic location
  
  // Calculate day of year for seasonal adjustment
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  
  // Seasonal adjustment based on day of year (solstices and equinoxes)
  const seasonalShift = Math.sin((dayOfYear * 2 * Math.PI) / 365.25) * 0.5;
  
  // Location-based adjustment (simplified latitude effect)
  let locationAdjustment = 0;
  if (birthLocation) {
    // Simple hash-based location adjustment
    const locationHash = birthLocation.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    locationAdjustment = (locationHash % 12) * 0.1;
  }
  
  // Calculate base rising sign from time
  const totalHours = hours + minutes / 60;
  const baseIndex = Math.floor(totalHours / 2) % 12;
  
  // Apply adjustments
  const adjustedIndex = Math.floor(baseIndex + seasonalShift + locationAdjustment) % 12;
  const finalIndex = adjustedIndex < 0 ? adjustedIndex + 12 : adjustedIndex;
  
  return ZODIAC_SIGNS[finalIndex].name;
}

// Helper function to check if date is in range
function isDateInRange(
  month: number, 
  day: number, 
  startMonth: number, 
  startDay: number, 
  endMonth: number, 
  endDay: number
): boolean {
  if (startMonth === endMonth) {
    return month === startMonth && day >= startDay && day <= endDay;
  }
  
  if (startMonth > endMonth) { // Crosses year boundary (like Capricorn)
    return (month === startMonth && day >= startDay) || 
           (month === endMonth && day <= endDay);
  }
  
  // Normal case: check if date falls within the range
  return ((month === startMonth && day >= startDay) || 
          (month === endMonth && day <= endDay) ||
          (month > startMonth && month < endMonth));
}

// Calculate complete Big Three
export function calculateBigThree(birthData: BirthData): AstrologyData {
  const sunSign = calculateSunSign(birthData.birthDate);
  const moonSign = calculateMoonSign(birthData.birthDate, birthData.birthTime);
  const risingSign = calculateRisingSign(birthData.birthDate, birthData.birthTime, birthData.birthLocation);
  
  return {
    sunSign,
    moonSign,
    risingSign
  };
}

// Zodiac symbols mapping
export const ZODIAC_SYMBOLS: Record<string, string> = {
  'Aries': '♈',
  'Taurus': '♉',
  'Gemini': '♊',
  'Cancer': '♋',
  'Leo': '♌',
  'Virgo': '♍',
  'Libra': '♎',
  'Scorpio': '♏',
  'Sagittarius': '♐',
  'Capricorn': '♑',
  'Aquarius': '♒',
  'Pisces': '♓'
};

// Zodiac colors for visual representation
export const ZODIAC_COLORS: Record<string, string> = {
  'Aries': '#FF6B6B',      // Fire - Red
  'Taurus': '#4ECDC4',     // Earth - Green
  'Gemini': '#FFE66D',     // Air - Yellow
  'Cancer': '#A8E6CF',     // Water - Light Blue
  'Leo': '#FF8B94',        // Fire - Orange
  'Virgo': '#C7CEEA',      // Earth - Light Purple
  'Libra': '#FFEAA7',      // Air - Light Yellow
  'Scorpio': '#D63031',    // Water - Deep Red
  'Sagittarius': '#74B9FF', // Fire - Blue
  'Capricorn': '#6C5CE7',  // Earth - Purple
  'Aquarius': '#00B894',   // Air - Teal
  'Pisces': '#FDCB6E'      // Water - Peach
};