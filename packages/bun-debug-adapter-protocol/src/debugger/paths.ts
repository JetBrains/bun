import path, {isAbsolute} from "node:path";
import {realpath} from "node:fs/promises";
import {pathToFileURL} from "node:url";

export async function tryResolveSymlink(_path: string): Promise<string | null> {
  try {
    return await realpath(_path);
  } catch {
    return null;
  }
}

export function isAbsolutePath(_path: string) {
  return path.posix.isAbsolute(_path) || path.win32.isAbsolute(_path);
}

export function toFileUrl(pathOrUrl: string): URL {
  if (isAbsolute(pathOrUrl)) {
    return pathToFileURL(pathOrUrl);
  }
  return new URL(pathOrUrl);
}