import { describe, it, expect } from 'vitest';
import { calculateDistributionStatus } from './distribution-status';
import type { PublicationStatus } from '@artxflow/types';

describe('calculateDistributionStatus', () => {
  it('returns PENDING for empty list', () => {
    expect(calculateDistributionStatus([])).toBe('PENDING');
  });

  it('returns PENDING when all publications are PENDING', () => {
    const pubs = [
      { status: 'PENDING' as PublicationStatus },
      { status: 'PENDING' as PublicationStatus },
    ];
    expect(calculateDistributionStatus(pubs)).toBe('PENDING');
  });

  it('returns PUBLISHED when all publications are PUBLISHED', () => {
    const pubs = [
      { status: 'PUBLISHED' as PublicationStatus },
      { status: 'PUBLISHED' as PublicationStatus },
    ];
    expect(calculateDistributionStatus(pubs)).toBe('PUBLISHED');
  });

  it('returns PARTIALLY_PUBLISHED when some succeed and some fail', () => {
    const pubs = [
      { status: 'PUBLISHED' as PublicationStatus },
      { status: 'FAILED' as PublicationStatus },
    ];
    expect(calculateDistributionStatus(pubs)).toBe('PARTIALLY_PUBLISHED');
  });

  it('returns PARTIALLY_PUBLISHED when some succeed and some have UNKNOWN_OUTCOME', () => {
    const pubs = [
      { status: 'PUBLISHED' as PublicationStatus },
      { status: 'UNKNOWN_OUTCOME' as PublicationStatus },
    ];
    expect(calculateDistributionStatus(pubs)).toBe('PARTIALLY_PUBLISHED');
  });

  it('returns IN_PROGRESS when some succeed but another is still RETRYING or QUEUED', () => {
    const pubs = [
      { status: 'PUBLISHED' as PublicationStatus },
      { status: 'RETRYING' as PublicationStatus },
    ];
    expect(calculateDistributionStatus(pubs)).toBe('IN_PROGRESS');
  });

  it('returns IN_PROGRESS when any publication is PUBLISHING or QUEUED without failures', () => {
    const pubs = [
      { status: 'PENDING' as PublicationStatus },
      { status: 'PUBLISHING' as PublicationStatus },
    ];
    expect(calculateDistributionStatus(pubs)).toBe('IN_PROGRESS');
  });

  it('returns FAILED when all publications are FAILED or UNKNOWN_OUTCOME', () => {
    const pubs = [
      { status: 'FAILED' as PublicationStatus },
      { status: 'UNKNOWN_OUTCOME' as PublicationStatus },
    ];
    expect(calculateDistributionStatus(pubs)).toBe('FAILED');
  });
});
