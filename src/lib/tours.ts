import type { TourLevel, TourMaterial } from '@/lib/types';

export const MAX_TOUR_LEVEL: TourLevel = 6;
export const TOUR_ADVANCEMENT_XP = 2000;
export const TOUR_LEVELS = [1, 2, 3, 4, 5, 6] as const satisfies readonly TourLevel[];

export interface TourDescriptor {
  level: TourLevel;
  name: string;
  label: string;
  material: TourMaterial;
  hasShield: boolean;
}

const TOUR_DESCRIPTORS: Record<TourLevel, TourDescriptor> = {
  1: {
    level: 1,
    name: 'Base',
    label: 'Base Tour',
    material: 'none',
    hasShield: false,
  },
  2: {
    level: 2,
    name: 'Bronze',
    label: 'Bronze Tour',
    material: 'bronze',
    hasShield: true,
  },
  3: {
    level: 3,
    name: 'Silver',
    label: 'Silver Tour',
    material: 'silver',
    hasShield: true,
  },
  4: {
    level: 4,
    name: 'Gold',
    label: 'Gold Tour',
    material: 'gold',
    hasShield: true,
  },
  5: {
    level: 5,
    name: 'Platinum',
    label: 'Platinum Tour',
    material: 'platinum',
    hasShield: true,
  },
  6: {
    level: 6,
    name: 'Diamond',
    label: 'Diamond Tour',
    material: 'diamond',
    hasShield: true,
  },
};

export function getTourDescriptor(tour: TourLevel): TourDescriptor {
  return TOUR_DESCRIPTORS[tour];
}

export function getTourLabel(tour: TourLevel): string {
  return TOUR_DESCRIPTORS[tour].label;
}

export function getTourName(tour: TourLevel): string {
  return TOUR_DESCRIPTORS[tour].name;
}

export function getTourMaterial(tour: TourLevel): TourMaterial {
  return TOUR_DESCRIPTORS[tour].material;
}

export function hasTourShield(tour: TourLevel): boolean {
  return TOUR_DESCRIPTORS[tour].hasShield;
}

export function canAdvanceTour(track: { xp: number; tour: TourLevel }): boolean {
  return track.xp >= TOUR_ADVANCEMENT_XP && track.tour < MAX_TOUR_LEVEL;
}

export function getNextTourLevel(currentTour: TourLevel): TourLevel {
  if (currentTour >= MAX_TOUR_LEVEL) {
    throw new RangeError('Track is already at the maximum Tour.');
  }

  return (currentTour + 1) as TourLevel;
}
