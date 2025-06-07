import { applyDecorators, UseInterceptors } from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import {
  multerConfig,
  multerConfigVideo,
  multerConfigDocument,
} from '../multer/multer.config';

export function SingleFileUpload(
  fieldName: string,
  fileType: 'image' | 'video' | 'document' = 'image',
) {
  const config =
    fileType === 'image'
      ? multerConfig
      : fileType === 'video'
        ? multerConfigVideo
        : multerConfigDocument;

  return applyDecorators(UseInterceptors(FileInterceptor(fieldName, config)));
}

export function MultipleFilesUpload(
  fieldName: string,
  maxCount: number,
  fileType: 'image' | 'video' | 'document' = 'image',
) {
  const config =
    fileType === 'image'
      ? multerConfig
      : fileType === 'video'
        ? multerConfigVideo
        : multerConfigDocument;

  return applyDecorators(
    UseInterceptors(FilesInterceptor(fieldName, maxCount, config)),
  );
}

export interface FileField {
  name: string;
  maxCount: number;
}

export function MultipleFieldsUpload(
  fields: FileField[],
  fileType: 'image' | 'video' | 'document' = 'image',
) {
  const config =
    fileType === 'image'
      ? multerConfig
      : fileType === 'video'
        ? multerConfigVideo
        : multerConfigDocument;

  return applyDecorators(
    UseInterceptors(FileFieldsInterceptor(fields, config)),
  );
}
