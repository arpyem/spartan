import { constants as fsConstants } from 'node:fs';
import { access, copyFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const packageJsonPath = resolve(rootDir, 'package.json');
const packageLockPath = resolve(rootDir, 'package-lock.json');
const envExamplePath = resolve(rootDir, '.env.example');
const envPath = resolve(rootDir, '.env');

const REQUIRED_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

class BootstrapError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BootstrapError';
  }
}

function logStep(message) {
  console.log(`\n[bootstrap] ${message}`);
}

async function fileExists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function parseMajorVersion(version) {
  return Number(version.replace(/^v/, '').split('.')[0]);
}

function verifyNodeVersion(engineRange) {
  const match = /^>=\s*(\d+)$/.exec(engineRange.trim());

  if (!match) {
    throw new BootstrapError(
      `Unsupported engines.node format "${engineRange}". Update scripts/bootstrap.mjs to understand it.`,
    );
  }

  const minimumMajor = Number(match[1]);
  const currentMajor = parseMajorVersion(process.version);

  if (currentMajor < minimumMajor) {
    throw new BootstrapError(
      `Node ${engineRange} is required. Current version is ${process.version}.`,
    );
  }
}

async function runNpmInstall() {
  const npmExecPath = process.env.npm_execpath;

  if (npmExecPath) {
    const npmArgs = npmExecPath.endsWith('.js')
      ? [npmExecPath, 'install']
      : ['install'];
    const command = npmExecPath.endsWith('.js') ? process.execPath : npmExecPath;

    await runCommand(command, npmArgs);
    return;
  }

  const fallbackCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  await runCommand(fallbackCommand, ['install']);
}

async function runCommand(command, args) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        npm_config_update_notifier: 'false',
      },
    });

    child.on('error', (error) => {
      rejectPromise(
        new BootstrapError(
          `Failed to run "${command} ${args.join(' ')}": ${error.message}`,
        ),
      );
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(
        new BootstrapError(
          `"${command} ${args.join(' ')}" exited with code ${code}.`,
        ),
      );
    });
  });
}

function parseEnvFile(content) {
  const entries = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries[key] = value;
  }

  return entries;
}

async function ensureEnvFile() {
  const envExists = await fileExists(envPath);

  if (envExists) {
    return { created: false };
  }

  if (!(await fileExists(envExamplePath))) {
    throw new BootstrapError(
      'Cannot create .env because .env.example is missing.',
    );
  }

  await copyFile(envExamplePath, envPath);
  return { created: true };
}

async function validateEnvValues() {
  const content = await readFile(envPath, 'utf8');
  const parsed = parseEnvFile(content);
  return REQUIRED_ENV_KEYS.filter((key) => {
    const value = parsed[key];
    return value === undefined || value.trim() === '';
  });
}

function printSuccessMessage() {
  console.log('\n[bootstrap] Environment is ready.');
  console.log('[bootstrap] Next steps:');
  console.log('  1. npm test');
  console.log('  2. npm run build');
  console.log('  3. npm run dev');
}

async function main() {
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

  verifyNodeVersion(packageJson.engines?.node ?? '');

  if (!(await fileExists(packageLockPath))) {
    throw new BootstrapError(
      'package-lock.json is required for reproducible setup but was not found.',
    );
  }

  logStep(`Node ${process.version} satisfies ${packageJson.engines.node}.`);
  logStep('Installing npm dependencies from package-lock.json...');
  await runNpmInstall();

  const envState = await ensureEnvFile();

  if (envState.created) {
    logStep('Created .env from .env.example.');
  } else {
    logStep('Found existing .env. Leaving local values untouched.');
  }

  const missingValues = await validateEnvValues();

  if (missingValues.length > 0) {
    throw new BootstrapError(
      [
        '.env exists, but required Firebase values are still blank.',
        `Fill these keys before continuing: ${missingValues.join(', ')}`,
        'After updating .env, rerun: npm run bootstrap',
      ].join('\n'),
    );
  }

  printSuccessMessage();
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n[bootstrap] ERROR: ${message}`);
  process.exit(1);
});
