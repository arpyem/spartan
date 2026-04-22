import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DevLogPanel } from '@/components/DevLogPanel';
import { devLog, devLogStore } from '@/lib/dev-logging';

describe('DevLogPanel', () => {
  let clipboardWriteText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    devLogStore.clear();
    vi.restoreAllMocks();
    clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: clipboardWriteText,
      },
    });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:spartan-dev-log'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  it('starts collapsed, opens, and filters entries', async () => {
    devLog.info('auth', 'bootstrap_started', { force: false });
    devLog.warn('write', 'log_workout_failed', { track: 'cardio' });
    const user = userEvent.setup();

    render(<DevLogPanel />);

    expect(screen.queryByLabelText(/Dev log panel/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Dev Logs/i }));

    expect(screen.getByLabelText(/Dev log panel/i)).toBeInTheDocument();
    expect(screen.getByText(/bootstrap_started/i)).toBeInTheDocument();
    expect(screen.getByText(/log_workout_failed/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Category/i), 'write');

    expect(screen.queryByText(/bootstrap_started/i)).not.toBeInTheDocument();
    expect(screen.getByText(/log_workout_failed/i)).toBeInTheDocument();
  });

  it('copies visible entries, downloads JSON, clears the log, and renders on narrow widths', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    devLog.info('route', 'route_changed', { pathname: '/log/cardio' });
    const user = userEvent.setup();

    render(<DevLogPanel />);

    await user.click(screen.getByRole('button', { name: /Dev Logs/i }));
    await user.click(screen.getByRole('button', { name: /Copy Visible Logs/i }));

    expect(await screen.findByRole('button', { name: /Copied/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Download JSON/i }));

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Clear/i }));

    await waitFor(() => {
      expect(screen.getByText(/No events match the current filters/i)).toBeInTheDocument();
    });
  });
});
