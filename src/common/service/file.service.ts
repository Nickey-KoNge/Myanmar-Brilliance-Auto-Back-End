// src/common/service/file.service.ts
import { ConfigService } from '@nestjs/config';
import { ImgFileService } from './imgfile.service';
import { LocalFileService } from './local-file.service';
import { IFileService } from './i-file.service';

export const FileServiceProvider = {
  provide: IFileService,
  useFactory: (configService: ConfigService) => {
    const driver = configService.get<string>('STORAGE_DRIVER', 'local');
    if (driver === 's3') {
      return new ImgFileService(configService);
    }
    return new LocalFileService(configService);
  },
  inject: [ConfigService],
};
