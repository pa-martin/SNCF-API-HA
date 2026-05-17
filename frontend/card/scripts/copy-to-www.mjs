import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..', '..');
const src = resolve(root, 'frontend/card/dist/sncf-train-card.js');
const dest = resolve(root, 'custom_components/sncf_trains/frontend/sncf-train-card.js');

await mkdir(dirname(dest), { recursive: true });
await copyFile(src, dest);
console.log(`Copied ${src} -> ${dest}`);

