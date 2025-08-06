import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, Club, League } from '../src/databases/typeorm/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Admin Club (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let clubRepository: Repository<Club>;
  let leagueRepository: Repository<League>;
  let accessToken: string;
  let testUser: User;
  let testLeague: League;

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
    clubRepository = moduleFixture.get<Repository<Club>>(getRepositoryToken(Club));
    leagueRepository = moduleFixture.get<Repository<League>>(getRepositoryToken(League));
  });

  beforeEach(async () => {
    // Clean up database before each test
    await clubRepository.clear();
    await leagueRepository.clear();
    await userRepository.clear();

    // Create test user
    testUser = userRepository.create({
      email: 'admin@test.com',
      password: '$argon2id$v=19$m=65536,t=3,p=4$hash',
      name: 'Test Admin',
      role: 'ADMIN',
    });
    await userRepository.save(testUser);

    // Create test league
    testLeague = await leagueRepository.save(
      leagueRepository.create({
        title: 'Test League',
        description: 'Test league description',
        logo: 'test-league-logo.png',
        country: 'England',
        level: 1,
      })
    );

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

  describe('/admin/club (POST)', () => {
    it('should create a new club', async () => {
      const createClubDto = {
        name: 'Manchester United',
        description: 'Premier League club',
        logo: 'man-utd-logo.png',
        country: 'England',
        city: 'Manchester',
        founded: 1878,
        leagueId: testLeague.id,
      };

      const response = await request(app.getHttpServer())
        .post('/admin/club')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createClubDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createClubDto.name);
      expect(response.body.description).toBe(createClubDto.description);
      expect(response.body.logo).toBe(createClubDto.logo);
      expect(response.body.country).toBe(createClubDto.country);
      expect(response.body.city).toBe(createClubDto.city);
      expect(response.body.founded).toBe(createClubDto.founded);
      expect(response.body.leagueId).toBe(testLeague.id);
    });

    it('should fail to create club without authentication', async () => {
      const createClubDto = {
        name: 'Manchester United',
        description: 'Premier League club',
        logo: 'man-utd-logo.png',
        country: 'England',
        city: 'Manchester',
        founded: 1878,
        leagueId: testLeague.id,
      };

      await request(app.getHttpServer())
        .post('/admin/club')
        .send(createClubDto)
        .expect(401);
    });

    it('should fail to create club with invalid data', async () => {
      const createClubDto = {
        name: '', // Invalid: empty name
        description: 'Premier League club',
        logo: 'man-utd-logo.png',
        country: 'England',
        city: 'Manchester',
        founded: -100, // Invalid: negative year
        leagueId: 99999, // Invalid: non-existent league
      };

      await request(app.getHttpServer())
        .post('/admin/club')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createClubDto)
        .expect(400);
    });
  });

  describe('/admin/club (GET)', () => {
    beforeEach(async () => {
      // Create test clubs
      const clubs = [
        {
          name: 'Manchester United',
          description: 'Premier League club',
          logo: 'man-utd-logo.png',
          country: 'England',
          city: 'Manchester',
          founded: 1878,
          leagueId: testLeague.id,
        },
        {
          name: 'Liverpool FC',
          description: 'Premier League club',
          logo: 'liverpool-logo.png',
          country: 'England',
          city: 'Liverpool',
          founded: 1892,
          leagueId: testLeague.id,
        },
        {
          name: 'Arsenal FC',
          description: 'Premier League club',
          logo: 'arsenal-logo.png',
          country: 'England',
          city: 'London',
          founded: 1886,
          leagueId: testLeague.id,
        },
      ];

      for (const club of clubs) {
        await clubRepository.save(clubRepository.create(club));
      }
    });

    it('should get all clubs with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/club')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('links');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.totalItems).toBeGreaterThan(0);
    });

    it('should filter clubs by league ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/club?filter.leagueId=${testLeague.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((club: Club) => club.leagueId === testLeague.id)).toBe(true);
    });

    it('should search clubs by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/club?search=Manchester')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.some((club: Club) => club.name.includes('Manchester'))).toBe(true);
    });

    it('should sort clubs by founded year', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/club?sortBy=founded:ASC')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const foundedYears = response.body.data.map((club: Club) => club.founded);
      const sortedYears = [...foundedYears].sort((a, b) => a - b);
      expect(foundedYears).toEqual(sortedYears);
    });
  });

  describe('/admin/club/:id (GET)', () => {
    let testClub: Club;

    beforeEach(async () => {
      testClub = await clubRepository.save(
        clubRepository.create({
          name: 'Test Club',
          description: 'Test club description',
          logo: 'test-club-logo.png',
          country: 'England',
          city: 'Test City',
          founded: 1900,
          leagueId: testLeague.id,
        })
      );
    });

    it('should get club by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/club/${testClub.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(testClub.id);
      expect(response.body.name).toBe(testClub.name);
      expect(response.body.description).toBe(testClub.description);
      expect(response.body.logo).toBe(testClub.logo);
      expect(response.body.country).toBe(testClub.country);
      expect(response.body.city).toBe(testClub.city);
      expect(response.body.founded).toBe(testClub.founded);
      expect(response.body.leagueId).toBe(testClub.leagueId);
    });

    it('should return 404 for non-existent club', async () => {
      await request(app.getHttpServer())
        .get('/admin/club/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/admin/club/:id (PATCH)', () => {
    let testClub: Club;

    beforeEach(async () => {
      testClub = await clubRepository.save(
        clubRepository.create({
          name: 'Original Club Name',
          description: 'Original description',
          logo: 'original-logo.png',
          country: 'England',
          city: 'Original City',
          founded: 1900,
          leagueId: testLeague.id,
        })
      );
    });

    it('should update club', async () => {
      const updateClubDto = {
        name: 'Updated Club Name',
        description: 'Updated description',
        city: 'Updated City',
        founded: 1901,
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/club/${testClub.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateClubDto)
        .expect(200);

      expect(response.body.name).toBe(updateClubDto.name);
      expect(response.body.description).toBe(updateClubDto.description);
      expect(response.body.city).toBe(updateClubDto.city);
      expect(response.body.founded).toBe(updateClubDto.founded);
      expect(response.body.logo).toBe(testClub.logo); // Should remain unchanged
      expect(response.body.country).toBe(testClub.country); // Should remain unchanged
      expect(response.body.leagueId).toBe(testClub.leagueId); // Should remain unchanged
    });

    it('should fail to update non-existent club', async () => {
      const updateClubDto = {
        name: 'Updated Club Name',
      };

      await request(app.getHttpServer())
        .patch('/admin/club/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateClubDto)
        .expect(404);
    });

    it('should fail to update with invalid data', async () => {
      const updateClubDto = {
        name: '', // Invalid: empty name
        founded: -100, // Invalid: negative year
      };

      await request(app.getHttpServer())
        .patch(`/admin/club/${testClub.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateClubDto)
        .expect(400);
    });
  });

  describe('/admin/club/:id (DELETE)', () => {
    let testClub: Club;

    beforeEach(async () => {
      testClub = await clubRepository.save(
        clubRepository.create({
          name: 'Club to Delete',
          description: 'Description',
          logo: 'logo.png',
          country: 'England',
          city: 'City',
          founded: 1900,
          leagueId: testLeague.id,
        })
      );
    });

    it('should delete club', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/club/${testClub.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify the club is deleted
      await request(app.getHttpServer())
        .get(`/admin/club/${testClub.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to delete non-existent club', async () => {
      await request(app.getHttpServer())
        .delete('/admin/club/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
}); 