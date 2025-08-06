import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, League } from '../src/databases/typeorm/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Admin Leagues (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let leagueRepository: Repository<League>;
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
    leagueRepository = moduleFixture.get<Repository<League>>(getRepositoryToken(League));
  });

  beforeEach(async () => {
    // Clean up database before each test
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

  describe('/admin/leagues (POST)', () => {
    it('should create a new league', async () => {
      const createLeagueDto = {
        title: 'Premier League',
        description: 'Top tier football league',
        logo: 'premier-league-logo.png',
        country: 'England',
        level: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/admin/leagues')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createLeagueDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createLeagueDto.title);
      expect(response.body.description).toBe(createLeagueDto.description);
      expect(response.body.logo).toBe(createLeagueDto.logo);
      expect(response.body.country).toBe(createLeagueDto.country);
      expect(response.body.level).toBe(createLeagueDto.level);
    });

    it('should create a league with parent league', async () => {
      // First create a parent league
      const parentLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'Parent League',
          description: 'Parent league description',
          logo: 'parent-logo.png',
          country: 'England',
          level: 1,
        })
      );

      const createLeagueDto = {
        title: 'Child League',
        description: 'Child league description',
        logo: 'child-logo.png',
        country: 'England',
        level: 2,
        parentLeagueId: parentLeague.id,
      };

      const response = await request(app.getHttpServer())
        .post('/admin/leagues')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createLeagueDto)
        .expect(201);

      expect(response.body.parentLeagueId).toBe(parentLeague.id);
    });

    it('should fail to create league without authentication', async () => {
      const createLeagueDto = {
        title: 'Premier League',
        description: 'Top tier football league',
        logo: 'premier-league-logo.png',
        country: 'England',
        level: 1,
      };

      await request(app.getHttpServer())
        .post('/admin/leagues')
        .send(createLeagueDto)
        .expect(401);
    });

    it('should fail to create league with invalid data', async () => {
      const createLeagueDto = {
        title: '', // Invalid: empty title
        description: 'Top tier football league',
        logo: 'premier-league-logo.png',
        country: 'England',
        level: -1, // Invalid: negative level
      };

      await request(app.getHttpServer())
        .post('/admin/leagues')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createLeagueDto)
        .expect(400);
    });
  });

  describe('/admin/leagues (GET)', () => {
    beforeEach(async () => {
      // Create test leagues
      const leagues = [
        {
          title: 'Premier League',
          description: 'Top tier league',
          logo: 'premier-logo.png',
          country: 'England',
          level: 1,
        },
        {
          title: 'Championship',
          description: 'Second tier league',
          logo: 'championship-logo.png',
          country: 'England',
          level: 2,
        },
        {
          title: 'La Liga',
          description: 'Spanish top league',
          logo: 'laliga-logo.png',
          country: 'Spain',
          level: 1,
        },
      ];

      for (const league of leagues) {
        await leagueRepository.save(leagueRepository.create(league));
      }
    });

    it('should get all leagues with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/leagues')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('links');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.totalItems).toBeGreaterThan(0);
    });

    it('should filter leagues by parent league ID', async () => {
      // Create a parent league
      const parentLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'Parent League',
          description: 'Parent league',
          logo: 'parent-logo.png',
          country: 'England',
          level: 1,
        })
      );

      // Create child leagues
      await leagueRepository.save(
        leagueRepository.create({
          title: 'Child League 1',
          description: 'Child league 1',
          logo: 'child1-logo.png',
          country: 'England',
          level: 2,
          parentLeagueId: parentLeague.id,
        })
      );

      await leagueRepository.save(
        leagueRepository.create({
          title: 'Child League 2',
          description: 'Child league 2',
          logo: 'child2-logo.png',
          country: 'England',
          level: 2,
          parentLeagueId: parentLeague.id,
        })
      );

      const response = await request(app.getHttpServer())
        .get(`/admin/leagues?filter.parentLeagueId=${parentLeague.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((league: League) => league.parentLeagueId === parentLeague.id)).toBe(true);
    });

    it('should search leagues by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/leagues?search=Premier')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.some((league: League) => league.title.includes('Premier'))).toBe(true);
    });
  });

  describe('/admin/leagues/roots (GET)', () => {
    beforeEach(async () => {
      // Create root leagues (no parent)
      const rootLeagues = [
        {
          title: 'Premier League',
          description: 'Top tier league',
          logo: 'premier-logo.png',
          country: 'England',
          level: 1,
        },
        {
          title: 'La Liga',
          description: 'Spanish top league',
          logo: 'laliga-logo.png',
          country: 'Spain',
          level: 1,
        },
      ];

      for (const league of rootLeagues) {
        await leagueRepository.save(leagueRepository.create(league));
      }

      // Create a parent league
      const parentLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'Parent League',
          description: 'Parent league',
          logo: 'parent-logo.png',
          country: 'England',
          level: 1,
        })
      );

      // Create child league
      await leagueRepository.save(
        leagueRepository.create({
          title: 'Child League',
          description: 'Child league',
          logo: 'child-logo.png',
          country: 'England',
          level: 2,
          parentLeagueId: parentLeague.id,
        })
      );
    });

    it('should get only root leagues (no parent)', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/leagues/roots')
        .expect(200);

      expect(response.body.data.every((league: League) => !league.parentLeagueId)).toBe(true);
    });
  });

  describe('/admin/leagues/:id/children (GET)', () => {
    let parentLeague: League;

    beforeEach(async () => {
      // Create parent league
      parentLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'Parent League',
          description: 'Parent league',
          logo: 'parent-logo.png',
          country: 'England',
          level: 1,
        })
      );

      // Create child leagues
      await leagueRepository.save(
        leagueRepository.create({
          title: 'Child League 1',
          description: 'Child league 1',
          logo: 'child1-logo.png',
          country: 'England',
          level: 2,
          parentLeagueId: parentLeague.id,
        })
      );

      await leagueRepository.save(
        leagueRepository.create({
          title: 'Child League 2',
          description: 'Child league 2',
          logo: 'child2-logo.png',
          country: 'England',
          level: 2,
          parentLeagueId: parentLeague.id,
        })
      );
    });

    it('should get children of a league', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/leagues/${parentLeague.id}/children`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.every((league: League) => league.parentLeagueId === parentLeague.id)).toBe(true);
    });

    it('should return empty array for league without children', async () => {
      const childLeague = response.body[0];
      const response2 = await request(app.getHttpServer())
        .get(`/admin/leagues/${childLeague.id}/children`)
        .expect(200);

      expect(response2.body).toEqual([]);
    });
  });

  describe('/admin/leagues/:id/parent (GET)', () => {
    let parentLeague: League;
    let childLeague: League;

    beforeEach(async () => {
      // Create parent league
      parentLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'Parent League',
          description: 'Parent league',
          logo: 'parent-logo.png',
          country: 'England',
          level: 1,
        })
      );

      // Create child league
      childLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'Child League',
          description: 'Child league',
          logo: 'child-logo.png',
          country: 'England',
          level: 2,
          parentLeagueId: parentLeague.id,
        })
      );
    });

    it('should get parent of a league', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/leagues/${childLeague.id}/parent`)
        .expect(200);

      expect(response.body.id).toBe(parentLeague.id);
      expect(response.body.title).toBe(parentLeague.title);
    });

    it('should return null for root league', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/leagues/${parentLeague.id}/parent`)
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('/admin/leagues/:id/hierarchy (GET)', () => {
    let grandParentLeague: League;
    let parentLeague: League;
    let childLeague: League;

    beforeEach(async () => {
      // Create grandparent league
      grandParentLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'Grandparent League',
          description: 'Grandparent league',
          logo: 'grandparent-logo.png',
          country: 'England',
          level: 1,
        })
      );

      // Create parent league
      parentLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'Parent League',
          description: 'Parent league',
          logo: 'parent-logo.png',
          country: 'England',
          level: 2,
          parentLeagueId: grandParentLeague.id,
        })
      );

      // Create child league
      childLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'Child League',
          description: 'Child league',
          logo: 'child-logo.png',
          country: 'England',
          level: 3,
          parentLeagueId: parentLeague.id,
        })
      );
    });

    it('should get full hierarchy of a league', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/leagues/${childLeague.id}/hierarchy`)
        .expect(200);

      expect(response.body.id).toBe(childLeague.id);
      expect(response.body.parentLeague).toBeDefined();
      expect(response.body.parentLeague.id).toBe(parentLeague.id);
      expect(response.body.parentLeague.parentLeague).toBeDefined();
      expect(response.body.parentLeague.parentLeague.id).toBe(grandParentLeague.id);
    });
  });

  describe('/admin/leagues/:id (GET)', () => {
    let testLeague: League;

    beforeEach(async () => {
      testLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'Test League',
          description: 'Test league description',
          logo: 'test-logo.png',
          country: 'England',
          level: 1,
        })
      );
    });

    it('should get league by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/leagues/${testLeague.id}`)
        .expect(200);

      expect(response.body.id).toBe(testLeague.id);
      expect(response.body.title).toBe(testLeague.title);
      expect(response.body.description).toBe(testLeague.description);
      expect(response.body.logo).toBe(testLeague.logo);
      expect(response.body.country).toBe(testLeague.country);
      expect(response.body.level).toBe(testLeague.level);
    });

    it('should return 404 for non-existent league', async () => {
      await request(app.getHttpServer())
        .get('/admin/leagues/99999')
        .expect(404);
    });
  });

  describe('/admin/leagues/:id (PATCH)', () => {
    let testLeague: League;

    beforeEach(async () => {
      testLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'Original Title',
          description: 'Original description',
          logo: 'original-logo.png',
          country: 'England',
          level: 1,
        })
      );
    });

    it('should update league', async () => {
      const updateLeagueDto = {
        title: 'Updated Title',
        description: 'Updated description',
        country: 'Spain',
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/leagues/${testLeague.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateLeagueDto)
        .expect(200);

      expect(response.body.title).toBe(updateLeagueDto.title);
      expect(response.body.description).toBe(updateLeagueDto.description);
      expect(response.body.country).toBe(updateLeagueDto.country);
      expect(response.body.logo).toBe(testLeague.logo); // Should remain unchanged
      expect(response.body.level).toBe(testLeague.level); // Should remain unchanged
    });

    it('should fail to update non-existent league', async () => {
      const updateLeagueDto = {
        title: 'Updated Title',
      };

      await request(app.getHttpServer())
        .patch('/admin/leagues/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateLeagueDto)
        .expect(404);
    });

    it('should fail to update with invalid data', async () => {
      const updateLeagueDto = {
        title: '', // Invalid: empty title
        level: -1, // Invalid: negative level
      };

      await request(app.getHttpServer())
        .patch(`/admin/leagues/${testLeague.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateLeagueDto)
        .expect(400);
    });
  });

  describe('/admin/leagues/:id (DELETE)', () => {
    let testLeague: League;

    beforeEach(async () => {
      testLeague = await leagueRepository.save(
        leagueRepository.create({
          title: 'League to Delete',
          description: 'Description',
          logo: 'logo.png',
          country: 'England',
          level: 1,
        })
      );
    });

    it('should delete league', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/leagues/${testLeague.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify the league is deleted
      await request(app.getHttpServer())
        .get(`/admin/leagues/${testLeague.id}`)
        .expect(404);
    });

    it('should fail to delete non-existent league', async () => {
      await request(app.getHttpServer())
        .delete('/admin/leagues/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
}); 