import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

export function makeDiskStorage(subfolder: string) {
  const dest = `uploads/${subfolder}`;
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
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
