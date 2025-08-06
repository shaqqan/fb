import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, Personal } from '../src/databases/typeorm/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Admin Personal (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let personalRepository: Repository<Personal>;
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
    personalRepository = moduleFixture.get<Repository<Personal>>(getRepositoryToken(Personal));
  });

  beforeEach(async () => {
    // Clean up database before each test
    await personalRepository.clear();
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

  describe('/admin/personal (POST)', () => {
    it('should create a new personal record', async () => {
      const createPersonalDto = {
        name: 'Lionel Messi',
        email: 'messi@example.com',
        phone: '+1234567890',
        position: 'Forward',
        nationality: 'Argentina',
        dateOfBirth: new Date('1987-06-24').toISOString(),
        height: 170,
        weight: 72,
        jerseyNumber: 10,
        status: 'ACTIVE',
      };

      const response = await request(app.getHttpServer())
        .post('/admin/personal')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPersonalDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createPersonalDto.name);
      expect(response.body.email).toBe(createPersonalDto.email);
      expect(response.body.phone).toBe(createPersonalDto.phone);
      expect(response.body.position).toBe(createPersonalDto.position);
      expect(response.body.nationality).toBe(createPersonalDto.nationality);
      expect(response.body.height).toBe(createPersonalDto.height);
      expect(response.body.weight).toBe(createPersonalDto.weight);
      expect(response.body.jerseyNumber).toBe(createPersonalDto.jerseyNumber);
      expect(response.body.status).toBe(createPersonalDto.status);
    });

    it('should fail to create personal without authentication', async () => {
      const createPersonalDto = {
        name: 'Lionel Messi',
        email: 'messi@example.com',
        phone: '+1234567890',
        position: 'Forward',
        nationality: 'Argentina',
        dateOfBirth: new Date('1987-06-24').toISOString(),
        height: 170,
        weight: 72,
        jerseyNumber: 10,
        status: 'ACTIVE',
      };

      await request(app.getHttpServer())
        .post('/admin/personal')
        .send(createPersonalDto)
        .expect(401);
    });

    it('should fail to create personal with invalid data', async () => {
      const createPersonalDto = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid email format
        phone: '+1234567890',
        position: 'Forward',
        nationality: 'Argentina',
        dateOfBirth: new Date('1987-06-24').toISOString(),
        height: -170, // Invalid: negative height
        weight: -72, // Invalid: negative weight
        jerseyNumber: -10, // Invalid: negative jersey number
        status: 'INVALID_STATUS', // Invalid status
      };

      await request(app.getHttpServer())
        .post('/admin/personal')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPersonalDto)
        .expect(400);
    });

    it('should fail to create personal with duplicate email', async () => {
      // First create a personal record
      await personalRepository.save(
        personalRepository.create({
          name: 'Cristiano Ronaldo',
          email: 'ronaldo@example.com',
          phone: '+1234567891',
          position: 'Forward',
          nationality: 'Portugal',
          dateOfBirth: new Date('1985-02-05'),
          height: 187,
          weight: 84,
          jerseyNumber: 7,
          status: 'ACTIVE',
        })
      );

      // Try to create another personal record with the same email
      const createPersonalDto = {
        name: 'Lionel Messi',
        email: 'ronaldo@example.com', // Duplicate email
        phone: '+1234567890',
        position: 'Forward',
        nationality: 'Argentina',
        dateOfBirth: new Date('1987-06-24').toISOString(),
        height: 170,
        weight: 72,
        jerseyNumber: 10,
        status: 'ACTIVE',
      };

      await request(app.getHttpServer())
        .post('/admin/personal')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPersonalDto)
        .expect(400);
    });
  });

  describe('/admin/personal (GET)', () => {
    beforeEach(async () => {
      // Create test personal records
      const personalRecords = [
        {
          name: 'Lionel Messi',
          email: 'messi@example.com',
          phone: '+1234567890',
          position: 'Forward',
          nationality: 'Argentina',
          dateOfBirth: new Date('1987-06-24'),
          height: 170,
          weight: 72,
          jerseyNumber: 10,
          status: 'ACTIVE',
        },
        {
          name: 'Cristiano Ronaldo',
          email: 'ronaldo@example.com',
          phone: '+1234567891',
          position: 'Forward',
          nationality: 'Portugal',
          dateOfBirth: new Date('1985-02-05'),
          height: 187,
          weight: 84,
          jerseyNumber: 7,
          status: 'ACTIVE',
        },
        {
          name: 'Neymar Jr',
          email: 'neymar@example.com',
          phone: '+1234567892',
          position: 'Forward',
          nationality: 'Brazil',
          dateOfBirth: new Date('1992-02-05'),
          height: 175,
          weight: 68,
          jerseyNumber: 11,
          status: 'INACTIVE',
        },
      ];

      for (const personal of personalRecords) {
        await personalRepository.save(personalRepository.create(personal));
      }
    });

    it('should get all personal records with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/personal')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('links');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.totalItems).toBeGreaterThan(0);
    });

    it('should filter personal by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/personal?filter.status=ACTIVE')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((personal: Personal) => personal.status === 'ACTIVE')).toBe(true);
    });

    it('should filter personal by position', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/personal?filter.position=Forward')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((personal: Personal) => personal.position === 'Forward')).toBe(true);
    });

    it('should filter personal by nationality', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/personal?filter.nationality=Argentina')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((personal: Personal) => personal.nationality === 'Argentina')).toBe(true);
    });

    it('should search personal by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/personal?search=Messi')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.some((personal: Personal) => personal.name.includes('Messi'))).toBe(true);
    });

    it('should search personal by email', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/personal?search=ronaldo@example.com')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.some((personal: Personal) => personal.email.includes('ronaldo@example.com'))).toBe(true);
    });

    it('should sort personal by date of birth', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/personal?sortBy=dateOfBirth:ASC')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const birthDates = response.body.data.map((personal: Personal) => new Date(personal.dateOfBirth));
      const sortedDates = [...birthDates].sort((a, b) => a.getTime() - b.getTime());
      expect(birthDates).toEqual(sortedDates);
    });

    it('should sort personal by jersey number', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/personal?sortBy=jerseyNumber:ASC')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const jerseyNumbers = response.body.data.map((personal: Personal) => personal.jerseyNumber);
      const sortedNumbers = [...jerseyNumbers].sort((a, b) => a - b);
      expect(jerseyNumbers).toEqual(sortedNumbers);
    });
  });

  describe('/admin/personal/:id (GET)', () => {
    let testPersonal: Personal;

    beforeEach(async () => {
      testPersonal = await personalRepository.save(
        personalRepository.create({
          name: 'Test Player',
          email: 'test.player@example.com',
          phone: '+1234567899',
          position: 'Midfielder',
          nationality: 'England',
          dateOfBirth: new Date('1995-01-01'),
          height: 180,
          weight: 75,
          jerseyNumber: 8,
          status: 'ACTIVE',
        })
      );
    });

    it('should get personal record by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/personal/${testPersonal.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(testPersonal.id);
      expect(response.body.name).toBe(testPersonal.name);
      expect(response.body.email).toBe(testPersonal.email);
      expect(response.body.phone).toBe(testPersonal.phone);
      expect(response.body.position).toBe(testPersonal.position);
      expect(response.body.nationality).toBe(testPersonal.nationality);
      expect(response.body.height).toBe(testPersonal.height);
      expect(response.body.weight).toBe(testPersonal.weight);
      expect(response.body.jerseyNumber).toBe(testPersonal.jerseyNumber);
      expect(response.body.status).toBe(testPersonal.status);
    });

    it('should return 404 for non-existent personal record', async () => {
      await request(app.getHttpServer())
        .get('/admin/personal/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/admin/personal/:id (PATCH)', () => {
    let testPersonal: Personal;

    beforeEach(async () => {
      testPersonal = await personalRepository.save(
        personalRepository.create({
          name: 'Original Player Name',
          email: 'original.player@example.com',
          phone: '+1234567899',
          position: 'Original Position',
          nationality: 'Original Country',
          dateOfBirth: new Date('1995-01-01'),
          height: 180,
          weight: 75,
          jerseyNumber: 8,
          status: 'ACTIVE',
        })
      );
    });

    it('should update personal record', async () => {
      const updatePersonalDto = {
        name: 'Updated Player Name',
        position: 'Updated Position',
        nationality: 'Updated Country',
        height: 185,
        weight: 80,
        jerseyNumber: 9,
        status: 'INACTIVE',
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/personal/${testPersonal.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePersonalDto)
        .expect(200);

      expect(response.body.name).toBe(updatePersonalDto.name);
      expect(response.body.position).toBe(updatePersonalDto.position);
      expect(response.body.nationality).toBe(updatePersonalDto.nationality);
      expect(response.body.height).toBe(updatePersonalDto.height);
      expect(response.body.weight).toBe(updatePersonalDto.weight);
      expect(response.body.jerseyNumber).toBe(updatePersonalDto.jerseyNumber);
      expect(response.body.status).toBe(updatePersonalDto.status);
      expect(response.body.email).toBe(testPersonal.email); // Should remain unchanged
      expect(response.body.phone).toBe(testPersonal.phone); // Should remain unchanged
    });

    it('should fail to update non-existent personal record', async () => {
      const updatePersonalDto = {
        name: 'Updated Player Name',
      };

      await request(app.getHttpServer())
        .patch('/admin/personal/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePersonalDto)
        .expect(404);
    });

    it('should fail to update with invalid data', async () => {
      const updatePersonalDto = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid email format
        height: -180, // Invalid: negative height
        weight: -75, // Invalid: negative weight
        jerseyNumber: -8, // Invalid: negative jersey number
      };

      await request(app.getHttpServer())
        .patch(`/admin/personal/${testPersonal.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePersonalDto)
        .expect(400);
    });
  });

  describe('/admin/personal/:id (DELETE)', () => {
    let testPersonal: Personal;

    beforeEach(async () => {
      testPersonal = await personalRepository.save(
        personalRepository.create({
          name: 'Player to Delete',
          email: 'delete.player@example.com',
          phone: '+1234567899',
          position: 'Test Position',
          nationality: 'Test Country',
          dateOfBirth: new Date('1995-01-01'),
          height: 180,
          weight: 75,
          jerseyNumber: 8,
          status: 'ACTIVE',
        })
      );
    });

    it('should delete personal record', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/personal/${testPersonal.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify the personal record is deleted
      await request(app.getHttpServer())
        .get(`/admin/personal/${testPersonal.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to delete non-existent personal record', async () => {
      await request(app.getHttpServer())
        .delete('/admin/personal/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
}); 