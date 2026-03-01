import { calculateChart, setSwissEphemeris } from '@astrologer/astro-core';
import { SwissEphemeris } from '@swisseph/browser';

let sweInitPromise: Promise<void> | null = null;

async function ensureSwissEphemerisInitialized() {
  if (sweInitPromise) {
    return sweInitPromise;
  }

  sweInitPromise = (async() => {
    const swe = new SwissEphemeris();
    await swe.init();
    setSwissEphemeris(swe);
  })();

  return sweInitPromise;
}

export async function calculateAstroCoreChart(date: Date, latitude: number, longitude: number): Promise<unknown> {
  await ensureSwissEphemerisInitialized();

  const chart = calculateChart({
    date: date.toISOString(),
    location: { latitude, longitude }
  });

  return chart;
}

