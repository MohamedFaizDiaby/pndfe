import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

/**
 * Racine absolue de stockage des fichiers uploades et generes (PDF).
 * Configurable via UPLOADS_DIR (utile pour pointer vers un disque persistant
 * monte par le fournisseur cloud, ex: /data/uploads sur Render). Resolue une
 * seule fois ici et reutilisee partout (upload, generation PDF, service
 * statique) pour eviter toute divergence de chemin entre ecriture et lecture.
 */
export function uploadsRoot(): string {
  return resolve(process.env.UPLOADS_DIR || 'uploads');
}

export function uploadsSubdir(subfolder: string): string {
  const dest = join(uploadsRoot(), subfolder);
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  return dest;
}

export function makeDiskStorage(subfolder: string) {
  const dest = uploadsSubdir(subfolder);
  return diskStorage({
    destination: dest,
    filename: (_req, file, cb) => {
      const unique = uuidv4();
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  });
}

export function publicUrlFor(subfolder: string, filename: string): string {
  return `/uploads/${subfolder}/${filename}`;
}

export const imageFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|pdf)$/)) {
    return cb(new Error('Format de fichier non supporte (jpg, png, webp, pdf uniquement)'), false);
  }
  cb(null, true);
};
