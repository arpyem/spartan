import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RankEmblem } from '@/components/RankEmblem';
import { RankUpModal } from '@/components/RankUpModal';
import { TourModal } from '@/components/TourModal';
import { XPBar } from '@/components/XPBar';
import type { RankUpEvent, TourAdvanceEvent } from '@/lib/types';

const rankUpEvent: RankUpEvent = {
  track: 'cardio',
  trackLabel: 'Cardio',
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

describe('Milestone 04 components', () => {
  afterEach(() => {
    vi.useRealTimers();
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

  it('supports tap dismissal and timed dismissal for rank-up celebrations', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const { rerender } = render(<RankUpModal event={rankUpEvent} onClose={onClose} />);

    expect(screen.getByRole('heading', { name: /Apprentice/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    rerender(<RankUpModal event={rankUpEvent} onClose={onClose} />);

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps Tour celebration locked until the ceremony completes', async () => {
    vi.useRealTimers();
    const onClose = vi.fn();
    const { container } = render(<TourModal event={tourAdvanceEvent} onClose={onClose} />);

    expect(screen.getByText(/Ceremony in progress/i)).toBeInTheDocument();

    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/Tap anywhere to continue/i, {}, { timeout: 5000 }),
    ).toBeInTheDocument();

    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  }, 10000);
});
