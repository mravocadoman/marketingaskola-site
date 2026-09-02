// Where is Chrome? The headless tools used to hard-code the Windows path, so
// every one of them silently failed on macOS. Set CHROME_PATH to override.
import { existsSync } from 'node:fs';

const CANDIDATES = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    `${process.env.HOME}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
  ],
  win32: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    `${process.env.LOCALAPPDATA || ''}/Google/Chrome/Application/chrome.exe`,
  ],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
};

export function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const found = (CANDIDATES[process.platform] || []).find((p) => existsSync(p));
  if (!found) {
    throw new Error(`Chrome not found for ${process.platform}. Install Google Chrome or set CHROME_PATH=/path/to/chrome.`);
  }
  return found;
}
