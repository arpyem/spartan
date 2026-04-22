import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfoModal } from '@/components/InfoModal';
import { RankEmblem } from '@/components/RankEmblem';
import { RankUpModal } from '@/components/RankUpModal';
import { TourModal } from '@/components/TourModal';
import { XPBar } from '@/components/XPBar';
import type { RankUpEvent, TourAdvanceEvent, UserDoc, WorkoutStats } from '@/lib/types';

const rankUpEvent: RankUpEvent = {
  track: 'cardio',
  trackLabel: 'Cardio',
  tour: 1,
  previousRankId: 0,
  previousRankName: 'Recruit',
  nextRankId: 1,
  nextRankName: 'Apprentice',
  xpBefore: 1,
  xpAfter: 2,
};

const tourAdvanceEvent: TourAdvanceEvent = {
  track: 'cardio',
  trackLabel: 'Cardio',
  previousTour: 1,
  previousTourLabel: 'Tour 1',
  nextTour: 2,
  nextTourLabel: 'Tour 2',
  previousRankId: 41,
  previousRankName: '5-Star General',
  nextRankId: 0,
  nextRankName: 'Recruit',
};

const userDoc: UserDoc = {
  displayName: 'Master Chief',
  email: 'chief@example.com',
  photoURL: '',
  createdAt: new Date('2026-04-01T00:00:00.000Z'),
  tracks: {
    cardio: { xp: 1, tour: 1 },
    legs: { xp: 0, tour: 1 },
    push: { xp: 0, tour: 1 },
    pull: { xp: 0, tour: 1 },
    core: { xp: 0, tour: 1 },
  },
};

const workoutStats: WorkoutStats = {
  totalWorkouts: 2,
  totalXp: 4,
  byTrack: {
    cardio: { workouts: 2, totalValue: 40, totalXp: 4 },
    legs: { workouts: 0, totalValue: 0, totalXp: 0 },
    push: { workouts: 0, totalValue: 0, totalXp: 0 },
    pull: { workouts: 0, totalValue: 0, totalXp: 0 },
    core: { workouts: 0, totalValue: 0, totalXp: 0 },
  },
};

function setReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? matches : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

describe('Milestone 04 components', () => {
  afterEach(() => {
    vi.useRealTimers();
    setReducedMotion(false);
  });

  it('renders shield state for each tour and does not fall back to numeric text', () => {
    const { rerender, container } = render(<RankEmblem rankId={7} tour={1} size={72} />);

    expect(screen.getByTestId('rank-emblem')).toHaveAttribute('data-shield', 'off');
    expect(container.querySelector('text')).toBeNull();

    rerender(<RankEmblem rankId={7} tour={5} size={72} />);

    expect(screen.getByTestId('rank-emblem')).toHaveAttribute('data-shield', 'on');
    expect(container.querySelector('text')).toBeNull();
  });

  it('updates the XP bar and switches styling for Double XP', async () => {
    const { container, rerender } = render(
      <XPBar progress={18} doubleXPActive={false} label="Cardio progress" />,
    );

    expect(screen.getByText('18%')).toBeInTheDocument();
    expect(screen.getByTestId('xp-bar')).toHaveAttribute('data-double-xp', 'false');

    rerender(<XPBar progress={82} doubleXPActive label="Cardio progress" />);

    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByTestId('xp-bar')).toHaveAttribute('data-double-xp', 'true');
    await waitFor(() => {
      const fill = container.querySelector('[data-testid="xp-bar"] > div[class*="bg-gradient-to-r"]');
      expect(fill).toBeTruthy();
    });
  });

  it('supports tap dismissal for rank-up celebrations', async () => {
    const onClose = vi.fn();
    render(<RankUpModal event={rankUpEvent} onClose={onClose} />);

    expect(screen.getByRole('heading', { name: /Apprentice/i })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /Apprentice/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('dialog', { name: /Apprentice/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses rank-up celebrations and preserves the active Tour shield', async () => {
    const onClose = vi.fn();
    render(<RankUpModal event={{ ...rankUpEvent, tour: 3 }} onClose={onClose} />);

    expect(screen.getByTestId('rank-emblem')).toHaveAttribute('data-tour', '3');
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    }, { timeout: 4500 });
  }, 6000);

  it('adds dialog semantics and restores focus when the info modal closes with Escape', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open record
          </button>
          <InfoModal
            isOpen={isOpen}
            user={userDoc}
            tracks={userDoc.tracks}
            stats={workoutStats}
            doubleXPStatus={{ active: false, upcoming: false }}
            globalRankId={0}
            onClose={() => setIsOpen(false)}
            onSignOut={() => {}}
          />
        </>
      );
    }

    render(<Harness />);

    const trigger = screen.getByRole('button', { name: /Open record/i });
    await user.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: /Spartan Details/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Spartan Details/i })).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('keeps Tour celebration locked until the ceremony completes', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<TourModal event={tourAdvanceEvent} onClose={onClose} />);

    expect(screen.getByRole('dialog', { name: /Tour 2/i })).toBeInTheDocument();
    expect(screen.getByText(/Ceremony in progress/i)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/Tap anywhere to continue/i, {}, { timeout: 5000 }),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  }, 10000);

  it('shortens the Tour ceremony when reduced motion is requested', async () => {
    vi.useRealTimers();
    setReducedMotion(true);
    const onClose = vi.fn();
    const { container } = render(<TourModal event={tourAdvanceEvent} onClose={onClose} />);

    expect(
      await screen.findByText(/Tap anywhere to continue/i, {}, { timeout: 1500 }),
    ).toBeInTheDocument();

    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  }, 4000);
});
