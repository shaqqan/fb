import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, Stadium } from '../src/databases/typeorm/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Admin Stadium (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let stadiumRepository: Repository<Stadium>;
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
    stadiumRepository = moduleFixture.get<Repository<Stadium>>(getRepositoryToken(Stadium));
  });

  beforeEach(async () => {
    // Clean up database before each test
    await stadiumRepository.clear();
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

  describe('/admin/stadium (POST)', () => {
    it('should create a new stadium', async () => {
      const createStadiumDto = {
        name: 'Old Trafford',
        description: 'Home of Manchester United',
        address: 'Sir Matt Busby Way, Manchester',
        capacity: 74140,
        city: 'Manchester',
        country: 'England',
      };

      const response = await request(app.getHttpServer())
        .post('/admin/stadium')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createStadiumDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createStadiumDto.name);
      expect(response.body.description).toBe(createStadiumDto.description);
      expect(response.body.address).toBe(createStadiumDto.address);
      expect(response.body.capacity).toBe(createStadiumDto.capacity);
      expect(response.body.city).toBe(createStadiumDto.city);
      expect(response.body.country).toBe(createStadiumDto.country);
    });

    it('should fail to create stadium without authentication', async () => {
      const createStadiumDto = {
        name: 'Old Trafford',
        description: 'Home of Manchester United',
        address: 'Sir Matt Busby Way, Manchester',
        capacity: 74140,
        city: 'Manchester',
        country: 'England',
      };

      await request(app.getHttpServer())
        .post('/admin/stadium')
        .send(createStadiumDto)
        .expect(401);
    });

    it('should fail to create stadium with invalid data', async () => {
      const createStadiumDto = {
        name: '', // Invalid: empty name
        description: 'Home of Manchester United',
        address: 'Sir Matt Busby Way, Manchester',
        capacity: -1000, // Invalid: negative capacity
        city: 'Manchester',
        country: 'England',
      };

      await request(app.getHttpServer())
        .post('/admin/stadium')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createStadiumDto)
        .expect(400);
    });
  });

  describe('/admin/stadium (GET)', () => {
    beforeEach(async () => {
      // Create test stadiums
      const stadiums = [
        {
          name: 'Old Trafford',
          description: 'Home of Manchester United',
          address: 'Sir Matt Busby Way, Manchester',
          capacity: 74140,
          city: 'Manchester',
          country: 'England',
        },
        {
          name: 'Anfield',
          description: 'Home of Liverpool FC',
          address: 'Anfield Road, Liverpool',
          capacity: 53394,
          city: 'Liverpool',
          country: 'England',
        },
        {
          name: 'Emirates Stadium',
          description: 'Home of Arsenal FC',
          address: 'Hornsey Road, London',
          capacity: 60704,
          city: 'London',
          country: 'England',
        },
      ];

      for (const stadium of stadiums) {
        await stadiumRepository.save(stadiumRepository.create(stadium));
      }
    });

    it('should get all stadiums with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/stadium')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('links');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.totalItems).toBeGreaterThan(0);
    });

    it('should filter stadiums by country', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/stadium?filter.country=England')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((stadium: Stadium) => stadium.country === 'England')).toBe(true);
    });

    it('should filter stadiums by city', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/stadium?filter.city=Manchester')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((stadium: Stadium) => stadium.city === 'Manchester')).toBe(true);
    });

    it('should search stadiums by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/stadium?search=Old Trafford')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.some((stadium: Stadium) => stadium.name.includes('Old Trafford'))).toBe(true);
    });

    it('should sort stadiums by capacity', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/stadium?sortBy=capacity:DESC')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const capacities = response.body.data.map((stadium: Stadium) => stadium.capacity);
      const sortedCapacities = [...capacities].sort((a, b) => b - a);
      expect(capacities).toEqual(sortedCapacities);
    });
  });

  describe('/admin/stadium/:id (GET)', () => {
    let testStadium: Stadium;

    beforeEach(async () => {
      testStadium = await stadiumRepository.save(
        stadiumRepository.create({
          name: 'Test Stadium',
          description: 'Test stadium description',
          address: 'Test Address',
          capacity: 50000,
          city: 'Test City',
          country: 'England',
        })
      );
    });

    it('should get stadium by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/stadium/${testStadium.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(testStadium.id);
      expect(response.body.name).toBe(testStadium.name);
      expect(response.body.description).toBe(testStadium.description);
      expect(response.body.address).toBe(testStadium.address);
      expect(response.body.capacity).toBe(testStadium.capacity);
      expect(response.body.city).toBe(testStadium.city);
      expect(response.body.country).toBe(testStadium.country);
    });

    it('should return 404 for non-existent stadium', async () => {
      await request(app.getHttpServer())
        .get('/admin/stadium/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/admin/stadium/:id (PATCH)', () => {
    let testStadium: Stadium;

    beforeEach(async () => {
      testStadium = await stadiumRepository.save(
        stadiumRepository.create({
          name: 'Original Stadium Name',
          description: 'Original description',
          address: 'Original Address',
          capacity: 50000,
          city: 'Original City',
          country: 'England',
        })
      );
    });

    it('should update stadium', async () => {
      const updateStadiumDto = {
        name: 'Updated Stadium Name',
        description: 'Updated description',
        address: 'Updated Address',
        capacity: 60000,
        city: 'Updated City',
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/stadium/${testStadium.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStadiumDto)
        .expect(200);

      expect(response.body.name).toBe(updateStadiumDto.name);
      expect(response.body.description).toBe(updateStadiumDto.description);
      expect(response.body.address).toBe(updateStadiumDto.address);
      expect(response.body.capacity).toBe(updateStadiumDto.capacity);
      expect(response.body.city).toBe(updateStadiumDto.city);
      expect(response.body.country).toBe(testStadium.country); // Should remain unchanged
    });

    it('should fail to update non-existent stadium', async () => {
      const updateStadiumDto = {
        name: 'Updated Stadium Name',
      };

      await request(app.getHttpServer())
        .patch('/admin/stadium/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStadiumDto)
        .expect(404);
    });

    it('should fail to update with invalid data', async () => {
      const updateStadiumDto = {
        name: '', // Invalid: empty name
        capacity: -1000, // Invalid: negative capacity
      };

      await request(app.getHttpServer())
        .patch(`/admin/stadium/${testStadium.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStadiumDto)
        .expect(400);
    });
  });

  describe('/admin/stadium/:id (DELETE)', () => {
    let testStadium: Stadium;

    beforeEach(async () => {
      testStadium = await stadiumRepository.save(
        stadiumRepository.create({
          name: 'Stadium to Delete',
          description: 'Description',
          address: 'Address',
          capacity: 50000,
          city: 'City',
          country: 'England',
        })
      );
    });

    it('should delete stadium', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/stadium/${testStadium.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify the stadium is deleted
      await request(app.getHttpServer())
        .get(`/admin/stadium/${testStadium.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to delete non-existent stadium', async () => {
      await request(app.getHttpServer())
        .delete('/admin/stadium/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
}); 