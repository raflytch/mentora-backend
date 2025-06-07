import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';

export const multerConfig: MulterOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return callback(
        new BadRequestException('Only image files are allowed!'),
        false,
      );
    }
    callback(null, true);
  },
};

export const multerConfigVideo: MulterOptions = {
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(mp4|avi|mov|wmv|flv|webm|mkv)$/)) {
      return callback(
        new BadRequestException('Only video files are allowed!'),
        false,
      );
    }
    callback(null, true);
  },
};

export const multerConfigDocument: MulterOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(pdf|doc|docx|ppt|pptx|xls|xlsx|txt)$/)) {
      return callback(
        new BadRequestException('Only document files are allowed!'),
        false,
      );
    }
    callback(null, true);
  },
};
