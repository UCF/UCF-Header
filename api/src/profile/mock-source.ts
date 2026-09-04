/**
 * Stand-in profile source.
 *
 * Derives a plausible profile from the principal id so the header can be
 * demonstrated end to end. Replace with the Pathify source; the interface is
 * the contract, this file is not.
 */

import type { ProfileData, ProfileSource } from './types.js';

const FIXTURES: Record<string, ProfileData> = {
  'student-1': {
    firstName: 'Alex',
    lastName: 'Rivera',
    links: [
      { label: 'myUCF', href: 'https://my.ucf.edu/' },
      { label: 'Webcourses', href: 'https://webcourses.ucf.edu/' },
      { label: 'Knights Email', href: 'https://outlook.com/knights.ucf.edu' },
    ],
  },
  'staff-1': {
    firstName: 'Dana',
    lastName: 'Okafor',
    links: [
      { label: 'myUCF', href: 'https://my.ucf.edu/' },
      { label: 'Workday', href: 'https://www.myworkday.com/ucf' },
    ],
  },
};

export function createMockProfileSource(): ProfileSource {
  return {
    name: 'mock',
    async get(principalId: string): Promise<ProfileData | null> {
      // A miss is the interesting case, not an error: it is what a real source
      // returns for a verified user it holds no record of. The payload builder
      // falls back to DEFAULT_NAME rather than rendering them signed out.
      return FIXTURES[principalId] ?? null;
    },
  };
}
