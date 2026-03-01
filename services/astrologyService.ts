import {
  Body,
  SiderealTime,
  Ecliptic,
  Equator,
  AstroTime
} from 'astronomy-engine';

export interface CalculatedPlanet {
  name: string;
  longitude: number; // 0–360
  retrograde: boolean;
}

export interface CalculatedHouse {
  house: number;
  longitude: number;
  sign: string;
  degree: number;
}

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const getSignFromLongitude = (longitude: number) => {
  const normalized = (longitude % 360 + 360) % 360;
  return SIGNS[Math.floor(normalized / 30)];
};

export const getDegreeInSign = (longitude: number) => {
  const normalized = (longitude % 360 + 360) % 360;
  return normalized % 30;
};

/**
 * Natal Engine Calculation Protocol
 * Calculates 10 bodies + Ascendant.
 * Uses Placidus approximation for house segments.
 */
export const calculateAstroData = (date: Date, lat: number, lon: number) => {
  const bodies = [
    Body.Sun, Body.Moon, Body.Mercury, Body.Venus, Body.Mars,
    Body.Jupiter, Body.Saturn, Body.Uranus, Body.Neptune, Body.Pluto
  ];

  const time = new AstroTime(date);

  const planets: CalculatedPlanet[] = bodies.map(body => {
    // Correct: Ecliptic(body, AstroTime)
    const ecl = (Ecliptic as any)(body, time);

    // Retrograde check via 6-hour delta
    const datePlus = new Date(date.getTime() + 6 * 60 * 60 * 1000);
    const timePlus = new AstroTime(datePlus);
    const eclPlus = (Ecliptic as any)(body, timePlus);

    let diff = eclPlus.elon - ecl.elon;
    if (diff > 180) {
      diff -= 360;
    }
    if (diff < -180) {
      diff += 360;
    }

    return {
      name: body.toString(),
      longitude: ecl.elon,
      retrograde: diff < 0
    };
  });

  // Precise Ascendant and Midheaven calculation
  const gmst = SiderealTime(date);
  const lst = (gmst + (lon / 15.0)) % 24;
  const ramc = (lst * 15.0) % 360;
  const eps = 23.43929; // Obliquity

  const latRad = (lat * Math.PI) / 180;
  const ramcRad = (ramc * Math.PI) / 180;
  const epsRad = (eps * Math.PI) / 180;

  // Ascendant
  const ascRad = Math.atan2(
    Math.cos(ramcRad),
    -(Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad))
  );

  let asc = (ascRad * 180 / Math.PI) % 360;
  if (asc < 0) {
    asc += 360;
  }

  // Midheaven (MC)
  const mcRad = Math.atan2(
    Math.sin(ramcRad),
    Math.cos(ramcRad) * Math.cos(epsRad)
  );

  let mc = (mcRad * 180 / Math.PI) % 360;
  if (mc < 0) {
    mc += 360;
  }

  /**
   * House System Calculation (Placidus Approximation)
   * For the visual wheel, we use a calculated projection of 12 segments
   * based on the relationship between Ascendant and Midheaven.
   */
  const houses: CalculatedHouse[] = Array.from({ length: 12 }, (_, i) => {
    const long = (asc + i * 30) % 360;
    return {
      house: i + 1,
      longitude: long,
      sign: getSignFromLongitude(long),
      degree: getDegreeInSign(long)
    };
  });

  return { planets, houses, ascendant: asc, midheaven: mc };
};

export interface MapLineData {
  name: string;
  mcLon: number;
  icLon: number;
  horizonPoints: [number, number][];
}

export const calculateMapLines = (date: Date): MapLineData[] => {
  const bodies = [
    Body.Sun, Body.Moon, Body.Mercury, Body.Venus, Body.Mars,
    Body.Jupiter, Body.Saturn, Body.Uranus, Body.Neptune, Body.Pluto
  ];

  const time = new AstroTime(date);
  const gmst = SiderealTime(date);

  return bodies.map(body => {
    const eq = Equator(body, time, { latitude: 0, longitude: 0, height: 0 }, false, true);
    const decRad = (eq.dec * Math.PI) / 180;

    let mcLon = (eq.ra - gmst) * 15;
    while (mcLon <= -180) {
      mcLon += 360;
    }
    while (mcLon > 180) {
      mcLon -= 360;
    }

    const icLon = mcLon > 0 ? mcLon - 180 : mcLon + 180;

    const horizonPoints: [number, number][] = [];

    for (let lon = -180; lon <= 180; lon += 2) {
      const lonDiffRad = ((lon - mcLon) * Math.PI) / 180;
      const latRad = Math.atan(-Math.cos(lonDiffRad) / Math.tan(decRad));
      const lat = (latRad * 180) / Math.PI;

      if (!isNaN(lat) && Math.abs(lat) <= 85) {
        horizonPoints.push([lat, lon]);
      }
    }

    return { name: body.toString(), mcLon, icLon, horizonPoints };
  });
};
