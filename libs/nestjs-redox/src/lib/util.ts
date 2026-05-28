/**
 * These utils were extracted from @nestjs/swagger because they are necessary and not available via new export declarations.
 * Date: 2026-05-28
 */

import { INestApplication } from '@nestjs/common';

export function getGlobalPrefix(app: INestApplication): string {
  const internalConfigRef = (app as any).config;
  return (internalConfigRef && internalConfigRef.getGlobalPrefix()) || '';
}

export const validateGlobalPrefix = (globalPrefix: string): boolean => globalPrefix && !globalPrefix.match(/^(\/?)$/);
export const validatePath = (inputPath: string): string => (inputPath.charAt(0) !== '/' ? '/' + inputPath : inputPath);
export function normalizeRelPath(input: string) {
  // replaces duplicate slashes with single slash: ////test///1 -> /test/1
  const output = input.replace(/\/\/+/g, '/');
  return output;
}
