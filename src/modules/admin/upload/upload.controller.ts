import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Delete,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
import { join, relative } from 'path';
import { promises as fs } from 'fs';

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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|pdf)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
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
          description:
            'Path of the file to delete (relative to uploads directory)',
          example: '/uploads/1756045389359-719138785.jpg',
        },
      },
      required: ['path'],
    },
  })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Body('path') filePath: string) {
    try {
      // 1. Normalize path
      // remove leading slash if exists + remove leading "uploads/"
      let cleanPath = filePath.replace(/^\/?uploads\//, '');
      cleanPath = cleanPath.replace(/^\.\//, ''); // remove "./" if exists

      // 2. Construct the full path safely
      const uploadsDir = join(process.cwd(), 'uploads');
      const fullPath = join(uploadsDir, cleanPath);

      // 3. Security check: ensure the file is inside uploads dir
      const relativePath = relative(uploadsDir, fullPath);
      if (relativePath.startsWith('..') || relativePath.includes('..')) {
        throw new BadRequestException('Invalid file path');
      }

      // 4. Check if file exists
      await fs.access(fullPath);

      // 5. Delete the file
      await fs.unlink(fullPath);

      return {
        message: 'File deleted successfully',
        path: cleanPath,
      };
    } catch (error: any) {
      // If file doesn't exist
      if (error.code === 'ENOENT') {
        throw new NotFoundException(`File not found: ${filePath}`);
      }
      throw error;
    }
  }
}
