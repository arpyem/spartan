export interface PwaRuntimeSnapshotOptions {
  hasWindow?: boolean;
  userAgent?: string;
  standaloneDisplayMode?: boolean;
  iosStandalone?: boolean;
}

export function isAppleMobileUserAgent(userAgent: string): boolean {
  return /iphone|ipad|ipod/.test(userAgent.toLowerCase());
}

export function isStandalonePwa(options?: PwaRuntimeSnapshotOptions): boolean {
  const hasWindow = options?.hasWindow ?? typeof window !== 'undefined';

  if (!hasWindow) {
    return false;
  }

  return Boolean(options?.standaloneDisplayMode || options?.iosStandalone);
}

export function shouldShowIosInstallInstructions(
  options?: PwaRuntimeSnapshotOptions,
): boolean {
  const hasWindow = options?.hasWindow ?? typeof window !== 'undefined';

  if (!hasWindow) {
    return false;
  }

  const userAgent = options?.userAgent ?? navigator.userAgent ?? '';

  return isAppleMobileUserAgent(userAgent) && !isStandalonePwa(options);
}
