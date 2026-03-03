//src/common/service/optimize-image.service.ts
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class OptimizeImageService {
  async optimizeImage(file: Express.Multer.File): Promise<Express.Multer.File> {
    const MAX_SIZE = 800;

    if (!file || !file.buffer) {
      throw new Error('Invalid image file buffer');
    }

    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    const currentWidth = metadata?.width || 0;
    const currentHeight = metadata?.height || 0;

    let processedBuffer: Buffer;

    if (currentWidth > MAX_SIZE || currentHeight > MAX_SIZE) {
      processedBuffer = await image
        .resize({
          width: MAX_SIZE,
          height: MAX_SIZE,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } else {
      processedBuffer = await image.jpeg({ quality: 80 }).toBuffer();
    }

    return {
      ...file,
      buffer: processedBuffer,
      size: processedBuffer.length,
      mimetype: 'image/jpeg',
      originalname: `${file.originalname.split('.')[0]}.jpg`,
    };
  }
}
