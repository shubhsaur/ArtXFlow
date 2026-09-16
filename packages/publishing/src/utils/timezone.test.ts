import { describe, it, expect } from 'vitest';
import {
  normalizeScheduledTimeToUtc,
  isValidTimezone,
  validateFutureScheduledTime,
  InvalidTimezoneError,
  PastScheduledTimeError,
} from './timezone';

describe('Timezone Normalization Utilities', () => {
  it('validates IANA timezone identifiers correctly', () => {
    expect(isValidTimezone('UTC')).toBe(true);
    expect(isValidTimezone('America/New_York')).toBe(true);
    expect(isValidTimezone('Europe/London')).toBe(true);
    expect(isValidTimezone('Asia/Kolkata')).toBe(true);
    expect(isValidTimezone('Asia/Tokyo')).toBe(true);

    expect(isValidTimezone('Invalid/Nonexistent_Zone')).toBe(false);
    expect(isValidTimezone('XYZ')).toBe(false);
  });

  it('throws InvalidTimezoneError on invalid timezone', () => {
    expect(() => normalizeScheduledTimeToUtc('2026-10-15T14:30:00', 'Fake/Timezone')).toThrow(
      InvalidTimezoneError,
    );
  });

  it('normalizes local time in UTC correctly', () => {
    const date = normalizeScheduledTimeToUtc('2026-10-15T14:30:00', 'UTC');
    expect(date.toISOString()).toBe('2026-10-15T14:30:00.000Z');
  });

  it('normalizes local time in America/New_York (EDT, UTC-4) to UTC', () => {
    // October 15 is EDT (UTC-4)
    const date = normalizeScheduledTimeToUtc('2026-10-15T14:30:00', 'America/New_York');
    // 14:30 EDT is 18:30 UTC
    expect(date.toISOString()).toBe('2026-10-15T18:30:00.000Z');
  });

  it('normalizes local time in America/New_York (EST, UTC-5) to UTC', () => {
    // December 15 is EST (UTC-5)
    const date = normalizeScheduledTimeToUtc('2026-12-15T14:30:00', 'America/New_York');
    // 14:30 EST is 19:30 UTC
    expect(date.toISOString()).toBe('2026-12-15T19:30:00.000Z');
  });

  it('normalizes local time in Asia/Kolkata (IST, UTC+5:30) to UTC', () => {
    const date = normalizeScheduledTimeToUtc('2026-10-15T14:30:00', 'Asia/Kolkata');
    // 14:30 IST is 09:00 UTC
    expect(date.toISOString()).toBe('2026-10-15T09:00:00.000Z');
  });

  it('normalizes local time in Asia/Tokyo (JST, UTC+9) to UTC', () => {
    const date = normalizeScheduledTimeToUtc('2026-10-15T14:30:00', 'Asia/Tokyo');
    // 14:30 JST is 05:30 UTC
    expect(date.toISOString()).toBe('2026-10-15T05:30:00.000Z');
  });

  it('handles strings with explicit timezone offset regardless of timezone parameter', () => {
    const isoString = '2026-10-15T14:30:00+02:00';
    const date = normalizeScheduledTimeToUtc(isoString, 'America/New_York');
    // 14:30 +02:00 is 12:30 UTC
    expect(date.toISOString()).toBe('2026-10-15T12:30:00.000Z');
  });

  it('validates future scheduled time correctly', () => {
    const futureDate = new Date(Date.now() + 60000); // 1 minute in future
    expect(() => validateFutureScheduledTime(futureDate)).not.toThrow();

    const pastDate = new Date(Date.now() - 60000); // 1 minute in past
    expect(() => validateFutureScheduledTime(pastDate)).toThrow(PastScheduledTimeError);
  });
});
