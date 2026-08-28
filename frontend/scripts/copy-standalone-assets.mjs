import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const standalone = join('.next', 'standalone');
const staticSrc = join('.next', 'static');
const staticDest = join(standalone, '.next', 'static');
const publicSrc = 'public';
const publicDest = join(standalone, 'public');

if (!existsSync(standalone)) {
  console.error('Standalone output missing. Ensure next.config has output: "standalone".');
  process.exit(1);
}

if (existsSync(staticSrc)) {
  mkdirSync(join(standalone, '.next'), { recursive: true });
  cpSync(staticSrc, staticDest, { recursive: true });
}

if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true });
}

console.log('Copied static + public into .next/standalone');
