// src/common/service/i-file.service.ts
export const IFileService = Symbol('IFileService');

export interface IFileService {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
  deleteFile(imageUrl: string): Promise<void>;
}
