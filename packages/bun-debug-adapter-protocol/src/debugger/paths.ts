import path, {isAbsolute} from "node:path";
import {pathToFileURL} from "node:url";

export function isAbsolutePath(_path: string) {
  return path.posix.isAbsolute(_path) || path.win32.isAbsolute(_path);
}

export function toFileUrl(pathOrUrl: string): URL {
  if (isAbsolute(pathOrUrl)) {
    return pathToFileURL(pathOrUrl);
  }
  return new URL(pathOrUrl);
}