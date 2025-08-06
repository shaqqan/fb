import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../src/databases/typeorm/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Admin Auth (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let accessToken: string;
  let refreshToken: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/admin/auth/signin (POST)', () => {
    it('should sign in with valid credentials', async () => {
      // Create a test user first
      const testUser = userRepository.create({
        email: 'admin@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$hash', // This would be hashed in real scenario
        name: 'Test Admin',
        role: 'ADMIN',
      });
      await userRepository.save(testUser);

      const signinDto = {
        email: 'admin@test.com',
        password: 'admin123',
      };

      const response = await request(app.getHttpServer())
        .post('/admin/auth/signin')
        .send(signinDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');

      accessToken = response.body.access_token;
      refreshToken = response.body.refresh_token;
    });

    it('should fail with invalid credentials', async () => {
      const signinDto = {
        email: 'invalid@test.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/admin/auth/signin')
        .send(signinDto)
        .expect(403);
    });

    it('should fail with missing email', async () => {
      const signinDto = {
        password: 'admin123',
      };

      await request(app.getHttpServer())
        .post('/admin/auth/signin')
        .send(signinDto)
        .expect(400);
    });

    it('should fail with missing password', async () => {
      const signinDto = {
        email: 'admin@test.com',
      };

      await request(app.getHttpServer())
        .post('/admin/auth/signin')
        .send(signinDto)
        .expect(400);
    });
  });

  describe('/admin/auth/logout (POST)', () => {
    it('should logout successfully with valid token', async () => {
      // First sign in to get a token
      const testUser = userRepository.create({
        email: 'admin@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$hash',
        name: 'Test Admin',
        role: 'ADMIN',
      });
      await userRepository.save(testUser);

      const signinResponse = await request(app.getHttpServer())
        .post('/admin/auth/signin')
        .send({
          email: 'admin@test.com',
          password: 'admin123',
        });

      const token = signinResponse.body.access_token;

      await request(app.getHttpServer())
        .post('/admin/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should fail logout without token', async () => {
      await request(app.getHttpServer())
        .post('/admin/auth/logout')
        .expect(401);
    });

    it('should fail logout with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/admin/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/admin/auth/refresh (POST)', () => {
    it('should refresh token successfully', async () => {
      // First sign in to get tokens
      const testUser = userRepository.create({
        email: 'admin@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$hash',
        name: 'Test Admin',
        role: 'ADMIN',
      });
      await userRepository.save(testUser);

      const signinResponse = await request(app.getHttpServer())
        .post('/admin/auth/signin')
        .send({
          email: 'admin@test.com',
          password: 'admin123',
        });

      const refreshToken = signinResponse.body.refresh_token;

      const response = await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    });

    it('should fail refresh with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .set('Authorization', 'Bearer invalid-refresh-token')
        .expect(401);
    });

    it('should fail refresh without token', async () => {
      await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .expect(401);
    });
  });
}); 