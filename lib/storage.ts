import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { dataDir } from '@/db';

// Photos du club stockées sur le disque du serveur (DATA_DIR/uploads).
// L'interface reprend les appels utilisés auparavant : put, get, delete.
function root() { return resolve(dataDir(), 'uploads'); }
function pathFor(key: string) {
  const full = resolve(root(), key);
  if (!full.startsWith(root() + '/')) throw new Error('Clé de fichier invalide.');
  return full;
}
export const bucket = {
  async put(key: string, bytes: ArrayBuffer) {
    const file = pathFor(key);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, new Uint8Array(bytes));
  },
  async get(key: string) {
    try { return { body: new Uint8Array(await readFile(pathFor(key))) }; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
  },
  async delete(keys: string | string[]) {
    for (const key of Array.isArray(keys) ? keys : [keys]) await rm(pathFor(key), { force: true });
  },
};
