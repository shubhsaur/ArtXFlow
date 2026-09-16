/**
 * Timezone normalization and validation utilities for scheduled publishing.
 */

export class InvalidTimezoneError extends Error {
  constructor(timezone: string) {
    super(`Invalid IANA timezone: '${timezone}'`);
    this.name = 'InvalidTimezoneError';
  }
}

export class PastScheduledTimeError extends Error {
  constructor(scheduledAt: Date) {
    super(
      `Scheduled publication time must be in the future (received: ${scheduledAt.toISOString()})`,
    );
    this.name = 'PastScheduledTimeError';
  }
}

/**
 * Validates whether a given timezone string is a valid IANA timezone name.
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes an input date or local datetime string in a specified timezone to a UTC Date object.
 *
 * @param scheduledAt Date object, ISO string with offset, or local date-time string (YYYY-MM-DDTHH:mm[:ss])
 * @param timezone IANA timezone name (defaults to 'UTC')
 * @returns Date normalized to UTC
 */
export function normalizeScheduledTimeToUtc(
  scheduledAt: string | Date,
  timezone: string = 'UTC',
): Date {
  const cleanTz = timezone ? timezone.trim() : 'UTC';
  if (!isValidTimezone(cleanTz)) {
    throw new InvalidTimezoneError(cleanTz);
  }

  if (scheduledAt instanceof Date) {
    if (isNaN(scheduledAt.getTime())) {
      throw new Error('Invalid Date object provided for scheduledAt');
    }
    return scheduledAt;
  }

  const trimmed = scheduledAt.trim();

  // If the string already has an explicit offset or Z (e.g. 2026-10-15T14:30:00Z or +05:30)
  if (/(?:Z|[+-]\d{2}(?::?\d{2})?)$/i.test(trimmed)) {
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date string: '${trimmed}'`);
    }
    return parsed;
  }

  // Parse components YYYY-MM-DD[T ]HH:mm(:ss)?
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(trimmed);
  if (!match) {
    const fallback = new Date(trimmed);
    if (isNaN(fallback.getTime())) {
      throw new Error(`Invalid date format: '${trimmed}'. Expected ISO format (YYYY-MM-DDTHH:mm)`);
    }
    return fallback;
  }

  const [, yearStr, monthStr, dayStr, hourStr, minStr, secStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  const sec = secStr ? parseInt(secStr, 10) : 0;

  // Base UTC guess
  const baseUtc = new Date(Date.UTC(year, month, day, hour, min, sec));

  if (cleanTz.toUpperCase() === 'UTC') {
    return baseUtc;
  }

  // Calculate timezone offset at base date
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: cleanTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(baseUtc);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const partYear = parseInt(partMap.year, 10);
  const partMonth = parseInt(partMap.month, 10) - 1;
  const partDay = parseInt(partMap.day, 10);
  const partHour = parseInt(partMap.hour, 10) % 24;
  const partMin = parseInt(partMap.minute, 10);
  const partSec = parseInt(partMap.second, 10);

  const displayedUtc = Date.UTC(partYear, partMonth, partDay, partHour, partMin, partSec);
  const offsetMs = displayedUtc - baseUtc.getTime();

  return new Date(baseUtc.getTime() - offsetMs);
}

/**
 * Validates that a scheduled date is in the future.
 */
export function validateFutureScheduledTime(date: Date, toleranceMs: number = 5000): void {
  if (date.getTime() <= Date.now() - toleranceMs) {
    throw new PastScheduledTimeError(date);
  }
}
