import {toFileUrl} from "./paths.ts";

const regexChars = new Set('/\\.?*()^${}|[]+'.split(''));

function codePointToPattern(cp: string, patterns: Set<string>) {
  if (cp === ':') { // colon used as a port separator in URL and also prohibited in most popular OS
    patterns.add(cp);
    return;
  }

  if (regexChars.has(cp)) {
    patterns.add('\\' + cp);
  } else {
    patterns.add(cp);
  }

  const encodedCp = encodeURIComponent(cp);
  if (encodedCp !== cp) {
    patterns.add(encodedCp);
  }
}

function generatePatternGroup(patterns: Set<string>) {
  switch (patterns.size) {
    case 0:
      return '';
    case 1:
      return patterns.values().next().value;
    case 2:
      const patternsList = Array.from(patterns);
      return patternsList.some(p => p.length > 1) ? `(?:${patternsList.join('|')})` : `[${patternsList.join('')}]`;
  }
}

function generateStringRegex(str: string, caseSensitive: boolean): string {
  let re = '';
  for (const cp of str) {
    const patterns = new Set<string>();
    if (caseSensitive) {
      codePointToPattern(cp, patterns)
    } else {
      codePointToPattern(cp.toLowerCase(), patterns);
      codePointToPattern(cp.toUpperCase(), patterns);
    }
    re += generatePatternGroup(patterns);
  }
  return re;
}

function trimDriveLetter(path: string) {
  return path.replace(/^[a-z]:\//i, '');
}

const slashRe = '[\\\\/]';
const forwardSlashOrDriveLetterRe = `(?:\\/|\\/?\\w:${slashRe})`;

/**
 * TODO: resolve symlinks - originalUrl|symLinked
 */
export function generateUrlRegex(absolutePathOrFileUrl: string, caseSensitive: boolean = false): string {
  const rawUrl = toFileUrl(absolutePathOrFileUrl);
  const urlString = trimDriveLetter(
    decodeURIComponent(rawUrl.toString().replace('file:///', ''))
  );

  const fileSchemeRe = `(?:${generateStringRegex('file', caseSensitive)}:\\/\\/)`;
  const urlPrefixRe = `^${fileSchemeRe}?${forwardSlashOrDriveLetterRe}?`;

  const pathRegex = urlString.split('/').map(part => generateStringRegex(part, caseSensitive)).join(slashRe);
  return urlPrefixRe + pathRegex;
}