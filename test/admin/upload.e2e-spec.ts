import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../src/databases/typeorm/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as path from 'path';
import * as fs from 'fs';

describe('Admin Upload (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let accessToken: string;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  beforeEach(async () => {
    // Clean up database before each test
    await userRepository.clear();

    // Create test user
    testUser = userRepository.create({
      email: 'admin@test.com',
      password: '$argon2id$v=19$m=65536,t=3,p=4$hash',
      name: 'Test Admin',
      role: 'ADMIN',
    });
    await userRepository.save(testUser);

    // Sign in to get access token
    const signinResponse = await request(app.getHttpServer())
      .post('/admin/auth/signin')
      .send({
        email: 'admin@test.com',
        password: 'admin123',
      });

    accessToken = signinResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/admin/upload (POST)', () => {
    it('should upload a single file', async () => {
      const testFilePath = path.join(__dirname, 'test-file.txt');
      
      // Create a test file
      fs.writeFileSync(testFilePath, 'This is a test file content');

      try {
        const response = await request(app.getHttpServer())
          .post('/admin/upload')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('file', testFilePath)
          .expect(201);

        expect(response.body).toHaveProperty('filename');
        expect(response.body).toHaveProperty('originalname');
        expect(response.body).toHaveProperty('mimetype');
        expect(response.body).toHaveProperty('size');
        expect(response.body.originalname).toBe('test-file.txt');
        expect(response.body.mimetype).toBe('text/plain');
        expect(response.body.size).toBeGreaterThan(0);
      } finally {
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });

    it('should upload multiple files', async () => {
      const testFile1Path = path.join(__dirname, 'test-file-1.txt');
      const testFile2Path = path.join(__dirname, 'test-file-2.txt');
      
      // Create test files
      fs.writeFileSync(testFile1Path, 'This is test file 1 content');
      fs.writeFileSync(testFile2Path, 'This is test file 2 content');

      try {
        const response = await request(app.getHttpServer())
          .post('/admin/upload')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('files', testFile1Path)
          .attach('files', testFile2Path)
          .expect(201);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
        
        expect(response.body[0]).toHaveProperty('filename');
        expect(response.body[0]).toHaveProperty('originalname');
        expect(response.body[0]).toHaveProperty('mimetype');
        expect(response.body[0]).toHaveProperty('size');
        
        expect(response.body[1]).toHaveProperty('filename');
        expect(response.body[1]).toHaveProperty('originalname');
        expect(response.body[1]).toHaveProperty('mimetype');
        expect(response.body[1]).toHaveProperty('size');
      } finally {
        // Clean up test files
        if (fs.existsSync(testFile1Path)) {
          fs.unlinkSync(testFile1Path);
        }
        if (fs.existsSync(testFile2Path)) {
          fs.unlinkSync(testFile2Path);
        }
      }
    });

    it('should upload an image file', async () => {
      const testImagePath = path.join(__dirname, 'test-image.jpg');
      
      // Create a test image file (minimal JPEG header)
      const jpegHeader = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01,
        0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08,
        0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x37, 0xFF, 0xD9
      ]);
      fs.writeFileSync(testImagePath, jpegHeader);

      try {
        const response = await request(app.getHttpServer())
          .post('/admin/upload')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('file', testImagePath)
          .expect(201);

        expect(response.body).toHaveProperty('filename');
        expect(response.body).toHaveProperty('originalname');
        expect(response.body).toHaveProperty('mimetype');
        expect(response.body).toHaveProperty('size');
        expect(response.body.originalname).toBe('test-image.jpg');
        expect(response.body.mimetype).toBe('image/jpeg');
        expect(response.body.size).toBeGreaterThan(0);
      } finally {
        // Clean up test file
        if (fs.existsSync(testImagePath)) {
          fs.unlinkSync(testImagePath);
        }
      }
    });

    it('should fail to upload without authentication', async () => {
      const testFilePath = path.join(__dirname, 'test-file.txt');
      
      // Create a test file
      fs.writeFileSync(testFilePath, 'This is a test file content');

      try {
        await request(app.getHttpServer())
          .post('/admin/upload')
          .attach('file', testFilePath)
          .expect(401);
      } finally {
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });

    it('should fail to upload without file', async () => {
      await request(app.getHttpServer())
        .post('/admin/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should fail to upload file that is too large', async () => {
      const testFilePath = path.join(__dirname, 'large-test-file.txt');
      
      // Create a large test file (e.g., 10MB)
      const largeContent = 'A'.repeat(10 * 1024 * 1024); // 10MB
      fs.writeFileSync(testFilePath, largeContent);

      try {
        await request(app.getHttpServer())
          .post('/admin/upload')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('file', testFilePath)
          .expect(400); // Should fail due to file size limit
      } finally {
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });

    it('should fail to upload unsupported file type', async () => {
      const testFilePath = path.join(__dirname, 'test-file.exe');
      
      // Create a test executable file
      fs.writeFileSync(testFilePath, 'This is a test executable file');

      try {
        await request(app.getHttpServer())
          .post('/admin/upload')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('file', testFilePath)
          .expect(400); // Should fail due to unsupported file type
      } finally {
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });
  });

  describe('/admin/upload/image (POST)', () => {
    it('should upload an image file to image endpoint', async () => {
      const testImagePath = path.join(__dirname, 'test-image.png');
      
      // Create a test PNG file (minimal PNG header)
      const pngHeader = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0x00, 0x00,
        0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00, 0x00,
        0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(testImagePath, pngHeader);

      try {
        const response = await request(app.getHttpServer())
          .post('/admin/upload/image')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('file', testImagePath)
          .expect(201);

        expect(response.body).toHaveProperty('filename');
        expect(response.body).toHaveProperty('originalname');
        expect(response.body).toHaveProperty('mimetype');
        expect(response.body).toHaveProperty('size');
        expect(response.body.originalname).toBe('test-image.png');
        expect(response.body.mimetype).toBe('image/png');
        expect(response.body.size).toBeGreaterThan(0);
      } finally {
        // Clean up test file
        if (fs.existsSync(testImagePath)) {
          fs.unlinkSync(testImagePath);
        }
      }
    });

    it('should fail to upload non-image file to image endpoint', async () => {
      const testFilePath = path.join(__dirname, 'test-file.txt');
      
      // Create a test text file
      fs.writeFileSync(testFilePath, 'This is a test file content');

      try {
        await request(app.getHttpServer())
          .post('/admin/upload/image')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('file', testFilePath)
          .expect(400); // Should fail because it's not an image
      } finally {
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });
  });

  describe('/admin/upload/document (POST)', () => {
    it('should upload a document file', async () => {
      const testDocPath = path.join(__dirname, 'test-document.pdf');
      
      // Create a test PDF file (minimal PDF header)
      const pdfHeader = Buffer.from([
        0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xC7, 0xEC,
        0x8F, 0xA2, 0x0A, 0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C,
        0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x20, 0x2F, 0x43, 0x61, 0x74, 0x61,
        0x6C, 0x6F, 0x67, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A,
        0x0A, 0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72, 0x0A, 0x3C, 0x3C, 0x2F,
        0x53, 0x69, 0x7A, 0x65, 0x20, 0x31, 0x3E, 0x3E, 0x0A, 0x25, 0x25, 0x45,
        0x4F, 0x46
      ]);
      fs.writeFileSync(testDocPath, pdfHeader);

      try {
        const response = await request(app.getHttpServer())
          .post('/admin/upload/document')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('file', testDocPath)
          .expect(201);

        expect(response.body).toHaveProperty('filename');
        expect(response.body).toHaveProperty('originalname');
        expect(response.body).toHaveProperty('mimetype');
        expect(response.body).toHaveProperty('size');
        expect(response.body.originalname).toBe('test-document.pdf');
        expect(response.body.mimetype).toBe('application/pdf');
        expect(response.body.size).toBeGreaterThan(0);
      } finally {
        // Clean up test file
        if (fs.existsSync(testDocPath)) {
          fs.unlinkSync(testDocPath);
        }
      }
    });

    it('should fail to upload non-document file to document endpoint', async () => {
      const testImagePath = path.join(__dirname, 'test-image.jpg');
      
      // Create a test image file
      const jpegHeader = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01,
        0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08,
        0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x37, 0xFF, 0xD9
      ]);
      fs.writeFileSync(testImagePath, jpegHeader);

      try {
        await request(app.getHttpServer())
          .post('/admin/upload/document')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('file', testImagePath)
          .expect(400); // Should fail because it's not a document
      } finally {
        // Clean up test file
        if (fs.existsSync(testImagePath)) {
          fs.unlinkSync(testImagePath);
        }
      }
    });
  });
}); 