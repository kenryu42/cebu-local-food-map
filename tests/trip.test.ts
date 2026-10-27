import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openStatus, formatPrice, placeIdFromHash, shareUrl, sortByDistance } from '../src/trip.ts';

// Cebu is UTC+8, so 04:00Z is noon in Cebu no matter where the test machine is
const cebuTime = (hhmm: string) => new Date(`2026-10-28T${hhmm}:00+08:00`);

test('a place is open during its hours in Cebu time', () => {
  assert.equal(openStatus([['11:00', '23:00']], cebuTime('12:00')), 'open');
});

test('a place closing within the hour is flagged as closing soon', () => {
  assert.equal(openStatus([['11:00', '23:00']], cebuTime('22:30')), 'closing-soon');
});

test('a place is closed before opening and after closing', () => {
  assert.equal(openStatus([['11:00', '23:00']], cebuTime('10:59')), 'closed');
  assert.equal(openStatus([['11:00', '23:00']], cebuTime('23:00')), 'closed');
});

test('hours that run past midnight stay open after midnight', () => {
  assert.equal(openStatus([['18:00', '02:00']], cebuTime('00:30')), 'open');
  assert.equal(openStatus([['18:00', '02:00']], cebuTime('03:00')), 'closed');
});

test('Japan time is an hour ahead and does not leak into the result', () => {
  // 10:30 in Cebu is 11:30 in Tokyo; the shop opening at 11:00 Cebu time is still closed
  assert.equal(openStatus([['11:00', '23:00']], new Date('2026-10-28T11:30:00+09:00')), 'closed');
});

test('free entry reads as free', () => {
  assert.equal(formatPrice({ min: 0, label: '門票' }, 2.463), '門票免費');
});

test('a peso range shows the yen equivalent rounded for quick reading', () => {
  assert.equal(formatPrice({ min: 150, max: 300, label: '每人' }, 2.463), '每人 ₱150–300（約 ¥370–740）');
});

test('prices of a thousand or more are grouped with commas', () => {
  assert.equal(formatPrice({ min: 1500, max: 2500, label: '每人' }, 2.463), '每人 ₱1,500–2,500（約 ¥3,690–6,160）');
});

test('a single peso price shows one yen amount', () => {
  assert.equal(formatPrice({ min: 30, label: '門票' }, 2.463), '門票 ₱30（約 ¥74）');
});

test('a shared link opens the place it names', () => {
  const ids = ['aa-bbq', 'temple-of-leah'];
  assert.equal(placeIdFromHash('#place=temple-of-leah', ids), 'temple-of-leah');
  assert.equal(placeIdFromHash(new URL(shareUrl('https://x.github.io/cebu-local-food-map/', 'aa-bbq')).hash, ids), 'aa-bbq');
});

test('a link to an unknown place or no place opens nothing', () => {
  assert.equal(placeIdFromHash('#place=nope', ['aa-bbq']), null);
  assert.equal(placeIdFromHash('', ['aa-bbq']), null);
});

test('places sort nearest first from where you stand', () => {
  const near = { id: 'near', lat: 10.29, lng: 124.0 };
  const far = { id: 'far', lat: 10.37, lng: 123.87 };
  const sorted = sortByDistance([far, near], { lat: 10.283, lng: 123.996 });
  assert.deepEqual(sorted.map(p => p.id), ['near', 'far']);
});
