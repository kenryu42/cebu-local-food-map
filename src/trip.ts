// Trip logic with no DOM or map dependencies: opening hours in Cebu time, peso/yen prices,
// share links and distances.

export type OpenStatus = 'open' | 'closing-soon' | 'closed';
export type Hours = [open: string, close: string][];
export interface Price {
  min: number;
  max?: number;
  label: string; // what the price is for, e.g. 每人 or 門票
}

const CLOSING_SOON_MINUTES = 60;

const cebuClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Manila',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function cebuMinutes(now: Date): number {
  const parts = cebuClock.formatToParts(now);
  const get = (type: string) => Number(parts.find(p => p.type === type)!.value);
  return get('hour') * 60 + get('minute');
}

// Status of a place at `now`, judged by the clock in Cebu rather than the phone's time zone
export function openStatus(hours: Hours, now: Date): OpenStatus {
  const minute = cebuMinutes(now);
  for (const [openAt, closeAt] of hours) {
    const open = toMinutes(openAt);
    const close = toMinutes(closeAt);
    const overnight = close <= open;
    const isOpen = overnight ? minute >= open || minute < close : minute >= open && minute < close;
    if (!isOpen) continue;
    const untilClose = (close - minute + 24 * 60) % (24 * 60);
    return untilClose <= CLOSING_SOON_MINUTES ? 'closing-soon' : 'open';
  }
  return 'closed';
}

// Yen to the nearest 10 once it is in the hundreds, so it reads at a glance
function toYen(php: number, rate: number): number {
  const yen = php * rate;
  return yen >= 100 ? Math.round(yen / 10) * 10 : Math.round(yen);
}

export function formatPrice(price: Price, rate: number): string {
  if (price.min === 0 && !price.max) return `${price.label}免費`;
  const n = (value: number) => value.toLocaleString('en-US');
  const peso = price.max ? `₱${n(price.min)}–${n(price.max)}` : `₱${n(price.min)}`;
  const yen = price.max ? `¥${n(toYen(price.min, rate))}–${n(toYen(price.max, rate))}` : `¥${n(toYen(price.min, rate))}`;
  return `${price.label} ${peso}（約 ${yen}）`;
}

export function shareUrl(pageUrl: string, placeId: string): string {
  const url = new URL(pageUrl);
  url.search = '';
  url.hash = `place=${encodeURIComponent(placeId)}`;
  return url.href;
}

export function placeIdFromHash(hash: string, knownIds: string[]): string | null {
  const id = new URLSearchParams(hash.replace(/^#/, '')).get('place');
  return id && knownIds.includes(id) ? id : null;
}

interface Point {
  lat: number;
  lng: number;
}

// Great-circle distance in km
export function distanceKm(a: Point, b: Point): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function sortByDistance<T extends Point>(points: T[], from: Point): T[] {
  return [...points].sort((a, b) => distanceKm(from, a) - distanceKm(from, b));
}
