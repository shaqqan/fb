import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, News } from '../src/databases/typeorm/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Admin News (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let newsRepository: Repository<News>;
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
    newsRepository = moduleFixture.get<Repository<News>>(getRepositoryToken(News));
  });

  beforeEach(async () => {
    // Clean up database before each test
    await newsRepository.clear();
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

  describe('/admin/news (POST)', () => {
    it('should create a new news article', async () => {
      const createNewsDto = {
        title: 'Test News Article',
        description: 'This is a test news article description',
        content: 'This is the full content of the test news article.',
        status: 'DRAFT',
      };

      const response = await request(app.getHttpServer())
        .post('/admin/news')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createNewsDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createNewsDto.title);
      expect(response.body.description).toBe(createNewsDto.description);
      expect(response.body.content).toBe(createNewsDto.content);
      expect(response.body.status).toBe(createNewsDto.status);
      expect(response.body.authorId).toBe(testUser.id);
    });

    it('should fail to create news without authentication', async () => {
      const createNewsDto = {
        title: 'Test News Article',
        description: 'This is a test news article description',
        content: 'This is the full content of the test news article.',
        status: 'DRAFT',
      };

      await request(app.getHttpServer())
        .post('/admin/news')
        .send(createNewsDto)
        .expect(401);
    });

    it('should fail to create news with invalid data', async () => {
      const createNewsDto = {
        title: '', // Invalid: empty title
        description: 'This is a test news article description',
        content: 'This is the full content of the test news article.',
        status: 'INVALID_STATUS', // Invalid status
      };

      await request(app.getHttpServer())
        .post('/admin/news')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createNewsDto)
        .expect(400);
    });
  });

  describe('/admin/news (GET)', () => {
    beforeEach(async () => {
      // Create test news articles
      const newsArticles = [
        {
          title: 'First News Article',
          description: 'First article description',
          content: 'First article content',
          status: 'PUBLISHED',
          authorId: testUser.id,
        },
        {
          title: 'Second News Article',
          description: 'Second article description',
          content: 'Second article content',
          status: 'DRAFT',
          authorId: testUser.id,
        },
        {
          title: 'Third News Article',
          description: 'Third article description',
          content: 'Third article content',
          status: 'PUBLISHED',
          authorId: testUser.id,
        },
      ];

      for (const article of newsArticles) {
        await newsRepository.save(newsRepository.create(article));
      }
    });

    it('should get all news articles with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/news')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('links');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.totalItems).toBeGreaterThan(0);
    });

    it('should filter news by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/news?status=PUBLISHED')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((article: News) => article.status === 'PUBLISHED')).toBe(true);
    });

    it('should search news by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/news?search=First')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.some((article: News) => article.title.includes('First'))).toBe(true);
    });

    it('should sort news by creation date', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/news?sortBy=createdAt:DESC')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const dates = response.body.data.map((article: News) => new Date(article.createdAt));
      const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime());
      expect(dates).toEqual(sortedDates);
    });
  });

  describe('/admin/news/:id (GET)', () => {
    let testNews: News;

    beforeEach(async () => {
      testNews = await newsRepository.save(
        newsRepository.create({
          title: 'Test News Article',
          description: 'Test description',
          content: 'Test content',
          status: 'PUBLISHED',
          authorId: testUser.id,
        })
      );
    });

    it('should get news article by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/news/${testNews.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(testNews.id);
      expect(response.body.title).toBe(testNews.title);
      expect(response.body.description).toBe(testNews.description);
      expect(response.body.content).toBe(testNews.content);
    });

    it('should return 404 for non-existent news article', async () => {
      await request(app.getHttpServer())
        .get('/admin/news/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/admin/news/:id (PATCH)', () => {
    let testNews: News;

    beforeEach(async () => {
      testNews = await newsRepository.save(
        newsRepository.create({
          title: 'Original Title',
          description: 'Original description',
          content: 'Original content',
          status: 'DRAFT',
          authorId: testUser.id,
        })
      );
    });

    it('should update news article', async () => {
      const updateNewsDto = {
        title: 'Updated Title',
        description: 'Updated description',
        status: 'PUBLISHED',
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/news/${testNews.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateNewsDto)
        .expect(200);

      expect(response.body.title).toBe(updateNewsDto.title);
      expect(response.body.description).toBe(updateNewsDto.description);
      expect(response.body.status).toBe(updateNewsDto.status);
      expect(response.body.content).toBe(testNews.content); // Should remain unchanged
    });

    it('should fail to update non-existent news article', async () => {
      const updateNewsDto = {
        title: 'Updated Title',
      };

      await request(app.getHttpServer())
        .patch('/admin/news/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateNewsDto)
        .expect(404);
    });

    it('should fail to update with invalid data', async () => {
      const updateNewsDto = {
        title: '', // Invalid: empty title
        status: 'INVALID_STATUS', // Invalid status
      };

      await request(app.getHttpServer())
        .patch(`/admin/news/${testNews.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateNewsDto)
        .expect(400);
    });
  });

  describe('/admin/news/:id (DELETE)', () => {
    let testNews: News;

    beforeEach(async () => {
      testNews = await newsRepository.save(
        newsRepository.create({
          title: 'News to Delete',
          description: 'Description',
          content: 'Content',
          status: 'DRAFT',
          authorId: testUser.id,
        })
      );
    });

    it('should delete news article', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/news/${testNews.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify the article is deleted
      await request(app.getHttpServer())
        .get(`/admin/news/${testNews.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to delete non-existent news article', async () => {
      await request(app.getHttpServer())
        .delete('/admin/news/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
}); 