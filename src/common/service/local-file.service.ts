// src/common/service/local-file.service.ts
// src/common/service/local-file.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IFileService } from './i-file.service';
import { generateUuidV7 } from '../utils/uuid.util';

@Injectable()
export class LocalFileService implements IFileService {
  private readonly logger = new Logger(LocalFileService.name);

  private readonly uploadPath = path.join(process.cwd(), 'public', 'uploads');

  constructor(private readonly configService: ConfigService) {}

  private get appUrl(): string {
    return this.configService.get<string>('APP_URL', 'http://localhost:3001');
  }

  // Upload image file
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${generateUuidV7()}${fileExtension}`;

      const targetDirectory = path.join(this.uploadPath, folder);
      const fullFilePath = path.join(targetDirectory, fileName);

      await fs.mkdir(targetDirectory, { recursive: true });

      // save file
      await fs.writeFile(fullFilePath, file.buffer);

      return `${this.appUrl}/uploads/${folder}/${fileName}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Local upload failed: ${errorMessage}`);
      throw new Error('Local file upload failed');
    }
  }

  // Delete image file
  async deleteFile(imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    try {
      const urlObj = new URL(imageUrl);
      const filePathInsideUploads = urlObj.pathname.replace('/uploads/', '');
      const fullFilePath = path.join(this.uploadPath, filePathInsideUploads);

      await fs.access(fullFilePath);
      await fs.unlink(fullFilePath);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Local file not found or already deleted: ${errorMessage}`,
      );
    }
  }
}
