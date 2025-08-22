import { Controller, Post, UploadedFile, UseInterceptors, Body, Delete, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs/promises';
import * as path from 'path';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, jpeg, png, gif, webp) - max 5MB',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Generated filename' },
        path: { type: 'string', description: 'File path URL' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      path: `/uploads/${file.filename}`,
    };
  }

  @Delete('file')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a file from the server' })
  @ApiBody({
    description: 'File path to delete',
    schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path of the file to delete (relative to uploads directory)',
          example: 'uploads/1234567890-123456789.jpg'
        }
      },
      required: ['path']
    }
  })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Body('path') filePath: string) {
    // Ensure the path is within the uploads directory for security
    const uploadsDir = path.resolve('./uploads');
    const fullPath = path.resolve(filePath);

    // Check if the file is within the uploads directory
    if (!fullPath.startsWith(uploadsDir)) {
      throw new NotFoundException('Invalid file path');
    }

    try {
      // Check if file exists
      await fs.access(fullPath);

      // Delete the file
      await fs.unlink(fullPath);

      return { message: 'File deleted successfully' };
    } catch (error) {
      // If file doesn't exist, throw NotFoundException
      if (error.code === 'ENOENT') {
        throw new NotFoundException('File not found');
      }
      // Rethrow other errors
      throw error;
    }
  }
}
