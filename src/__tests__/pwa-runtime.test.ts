import { isAppleMobileUserAgent, isStandalonePwa, shouldShowIosInstallInstructions } from '@/lib/pwa-runtime';

describe('pwa runtime helpers', () => {
  it('detects Apple mobile browsers for install fallback copy', () => {
    expect(
      isAppleMobileUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      ),
    ).toBe(true);
    expect(
      isAppleMobileUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/135.0.0.0 Safari/537.36',
      ),
    ).toBe(false);
  });

  it('treats display-mode and iOS standalone launches as installed PWAs', () => {
    expect(
      isStandalonePwa({
        hasWindow: true,
        standaloneDisplayMode: true,
        iosStandalone: false,
      }),
    ).toBe(true);
    expect(
      isStandalonePwa({
        hasWindow: true,
        standaloneDisplayMode: false,
        iosStandalone: true,
      }),
    ).toBe(true);
    expect(
      isStandalonePwa({
        hasWindow: true,
        standaloneDisplayMode: false,
        iosStandalone: false,
      }),
    ).toBe(false);
  });

  it('only shows iOS install instructions when not already standalone', () => {
    expect(
      shouldShowIosInstallInstructions({
        hasWindow: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
        standaloneDisplayMode: false,
        iosStandalone: false,
      }),
    ).toBe(true);
    expect(
      shouldShowIosInstallInstructions({
        hasWindow: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
        standaloneDisplayMode: true,
        iosStandalone: false,
      }),
    ).toBe(false);
  });
});
