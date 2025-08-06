import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, Match, Club, League, Stadium } from '../src/databases/typeorm/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Admin Match Schedule (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let matchRepository: Repository<Match>;
  let clubRepository: Repository<Club>;
  let leagueRepository: Repository<League>;
  let stadiumRepository: Repository<Stadium>;
  let accessToken: string;
  let testUser: User;
  let testLeague: League;
  let homeClub: Club;
  let awayClub: Club;
  let testStadium: Stadium;

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
    matchRepository = moduleFixture.get<Repository<Match>>(getRepositoryToken(Match));
    clubRepository = moduleFixture.get<Repository<Club>>(getRepositoryToken(Club));
    leagueRepository = moduleFixture.get<Repository<League>>(getRepositoryToken(League));
    stadiumRepository = moduleFixture.get<Repository<Stadium>>(getRepositoryToken(Stadium));
  });

  beforeEach(async () => {
    // Clean up database before each test
    await matchRepository.clear();
    await clubRepository.clear();
    await stadiumRepository.clear();
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

    // Create test clubs
    homeClub = await clubRepository.save(
      clubRepository.create({
        name: 'Home Club',
        description: 'Home club description',
        logo: 'home-club-logo.png',
        country: 'England',
        city: 'Home City',
        founded: 1900,
        leagueId: testLeague.id,
      })
    );

    awayClub = await clubRepository.save(
      clubRepository.create({
        name: 'Away Club',
        description: 'Away club description',
        logo: 'away-club-logo.png',
        country: 'England',
        city: 'Away City',
        founded: 1901,
        leagueId: testLeague.id,
      })
    );

    // Create test stadium
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

  describe('/admin/match-schedule (POST)', () => {
    it('should create a new match', async () => {
      const createMatchDto = {
        homeClubId: homeClub.id,
        awayClubId: awayClub.id,
        leagueId: testLeague.id,
        stadiumId: testStadium.id,
        scheduledDate: new Date('2024-12-25T15:00:00Z').toISOString(),
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null,
      };

      const response = await request(app.getHttpServer())
        .post('/admin/match-schedule')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createMatchDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.homeClubId).toBe(homeClub.id);
      expect(response.body.awayClubId).toBe(awayClub.id);
      expect(response.body.leagueId).toBe(testLeague.id);
      expect(response.body.stadiumId).toBe(testStadium.id);
      expect(response.body.status).toBe(createMatchDto.status);
      expect(response.body.homeScore).toBeNull();
      expect(response.body.awayScore).toBeNull();
    });

    it('should fail to create match without authentication', async () => {
      const createMatchDto = {
        homeClubId: homeClub.id,
        awayClubId: awayClub.id,
        leagueId: testLeague.id,
        stadiumId: testStadium.id,
        scheduledDate: new Date('2024-12-25T15:00:00Z').toISOString(),
        status: 'SCHEDULED',
      };

      await request(app.getHttpServer())
        .post('/admin/match-schedule')
        .send(createMatchDto)
        .expect(401);
    });

    it('should fail to create match with invalid data', async () => {
      const createMatchDto = {
        homeClubId: 99999, // Invalid: non-existent club
        awayClubId: awayClub.id,
        leagueId: testLeague.id,
        stadiumId: testStadium.id,
        scheduledDate: 'invalid-date', // Invalid date
        status: 'INVALID_STATUS', // Invalid status
      };

      await request(app.getHttpServer())
        .post('/admin/match-schedule')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createMatchDto)
        .expect(400);
    });

    it('should fail to create match with same home and away club', async () => {
      const createMatchDto = {
        homeClubId: homeClub.id,
        awayClubId: homeClub.id, // Same as home club
        leagueId: testLeague.id,
        stadiumId: testStadium.id,
        scheduledDate: new Date('2024-12-25T15:00:00Z').toISOString(),
        status: 'SCHEDULED',
      };

      await request(app.getHttpServer())
        .post('/admin/match-schedule')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createMatchDto)
        .expect(400);
    });
  });

  describe('/admin/match-schedule (GET)', () => {
    beforeEach(async () => {
      // Create test matches
      const matches = [
        {
          homeClubId: homeClub.id,
          awayClubId: awayClub.id,
          leagueId: testLeague.id,
          stadiumId: testStadium.id,
          scheduledDate: new Date('2024-12-25T15:00:00Z'),
          status: 'SCHEDULED',
          homeScore: null,
          awayScore: null,
        },
        {
          homeClubId: awayClub.id,
          awayClubId: homeClub.id,
          leagueId: testLeague.id,
          stadiumId: testStadium.id,
          scheduledDate: new Date('2024-12-26T15:00:00Z'),
          status: 'COMPLETED',
          homeScore: 2,
          awayScore: 1,
        },
        {
          homeClubId: homeClub.id,
          awayClubId: awayClub.id,
          leagueId: testLeague.id,
          stadiumId: testStadium.id,
          scheduledDate: new Date('2024-12-27T15:00:00Z'),
          status: 'CANCELLED',
          homeScore: null,
          awayScore: null,
        },
      ];

      for (const match of matches) {
        await matchRepository.save(matchRepository.create(match));
      }
    });

    it('should get all matches with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/match-schedule')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('links');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.totalItems).toBeGreaterThan(0);
    });

    it('should filter matches by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/match-schedule?filter.status=SCHEDULED')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((match: Match) => match.status === 'SCHEDULED')).toBe(true);
    });

    it('should filter matches by league ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/match-schedule?filter.leagueId=${testLeague.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((match: Match) => match.leagueId === testLeague.id)).toBe(true);
    });

    it('should filter matches by date range', async () => {
      const startDate = '2024-12-25';
      const endDate = '2024-12-26';
      
      const response = await request(app.getHttpServer())
        .get(`/admin/match-schedule?filter.scheduledDate=${startDate},${endDate}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should sort matches by scheduled date', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/match-schedule?sortBy=scheduledDate:ASC')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const dates = response.body.data.map((match: Match) => new Date(match.scheduledDate));
      const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
      expect(dates).toEqual(sortedDates);
    });
  });

  describe('/admin/match-schedule/:id (GET)', () => {
    let testMatch: Match;

    beforeEach(async () => {
      testMatch = await matchRepository.save(
        matchRepository.create({
          homeClubId: homeClub.id,
          awayClubId: awayClub.id,
          leagueId: testLeague.id,
          stadiumId: testStadium.id,
          scheduledDate: new Date('2024-12-25T15:00:00Z'),
          status: 'SCHEDULED',
          homeScore: null,
          awayScore: null,
        })
      );
    });

    it('should get match by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/match-schedule/${testMatch.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(testMatch.id);
      expect(response.body.homeClubId).toBe(testMatch.homeClubId);
      expect(response.body.awayClubId).toBe(testMatch.awayClubId);
      expect(response.body.leagueId).toBe(testMatch.leagueId);
      expect(response.body.stadiumId).toBe(testMatch.stadiumId);
      expect(response.body.status).toBe(testMatch.status);
    });

    it('should return 404 for non-existent match', async () => {
      await request(app.getHttpServer())
        .get('/admin/match-schedule/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/admin/match-schedule/:id (PATCH)', () => {
    let testMatch: Match;

    beforeEach(async () => {
      testMatch = await matchRepository.save(
        matchRepository.create({
          homeClubId: homeClub.id,
          awayClubId: awayClub.id,
          leagueId: testLeague.id,
          stadiumId: testStadium.id,
          scheduledDate: new Date('2024-12-25T15:00:00Z'),
          status: 'SCHEDULED',
          homeScore: null,
          awayScore: null,
        })
      );
    });

    it('should update match', async () => {
      const updateMatchDto = {
        scheduledDate: new Date('2024-12-26T16:00:00Z').toISOString(),
        status: 'IN_PROGRESS',
        homeScore: 1,
        awayScore: 0,
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/match-schedule/${testMatch.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateMatchDto)
        .expect(200);

      expect(response.body.status).toBe(updateMatchDto.status);
      expect(response.body.homeScore).toBe(updateMatchDto.homeScore);
      expect(response.body.awayScore).toBe(updateMatchDto.awayScore);
      expect(response.body.homeClubId).toBe(testMatch.homeClubId); // Should remain unchanged
      expect(response.body.awayClubId).toBe(testMatch.awayClubId); // Should remain unchanged
    });

    it('should fail to update non-existent match', async () => {
      const updateMatchDto = {
        status: 'COMPLETED',
      };

      await request(app.getHttpServer())
        .patch('/admin/match-schedule/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateMatchDto)
        .expect(404);
    });

    it('should fail to update with invalid data', async () => {
      const updateMatchDto = {
        scheduledDate: 'invalid-date', // Invalid date
        status: 'INVALID_STATUS', // Invalid status
        homeScore: -1, // Invalid: negative score
      };

      await request(app.getHttpServer())
        .patch(`/admin/match-schedule/${testMatch.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateMatchDto)
        .expect(400);
    });
  });

  describe('/admin/match-schedule/:id (DELETE)', () => {
    let testMatch: Match;

    beforeEach(async () => {
      testMatch = await matchRepository.save(
        matchRepository.create({
          homeClubId: homeClub.id,
          awayClubId: awayClub.id,
          leagueId: testLeague.id,
          stadiumId: testStadium.id,
          scheduledDate: new Date('2024-12-25T15:00:00Z'),
          status: 'SCHEDULED',
          homeScore: null,
          awayScore: null,
        })
      );
    });

    it('should delete match', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/match-schedule/${testMatch.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify the match is deleted
      await request(app.getHttpServer())
        .get(`/admin/match-schedule/${testMatch.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to delete non-existent match', async () => {
      await request(app.getHttpServer())
        .delete('/admin/match-schedule/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/admin/match-schedule/bulk (POST)', () => {
    it('should create multiple matches in bulk', async () => {
      const bulkCreateDto = {
        matches: [
          {
            homeClubId: homeClub.id,
            awayClubId: awayClub.id,
            leagueId: testLeague.id,
            stadiumId: testStadium.id,
            scheduledDate: new Date('2024-12-25T15:00:00Z').toISOString(),
            status: 'SCHEDULED',
          },
          {
            homeClubId: awayClub.id,
            awayClubId: homeClub.id,
            leagueId: testLeague.id,
            stadiumId: testStadium.id,
            scheduledDate: new Date('2024-12-26T15:00:00Z').toISOString(),
            status: 'SCHEDULED',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/admin/match-schedule/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bulkCreateDto)
        .expect(201);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[1]).toHaveProperty('id');
    });

    it('should fail to create bulk matches with invalid data', async () => {
      const bulkCreateDto = {
        matches: [
          {
            homeClubId: 99999, // Invalid: non-existent club
            awayClubId: awayClub.id,
            leagueId: testLeague.id,
            stadiumId: testStadium.id,
            scheduledDate: new Date('2024-12-25T15:00:00Z').toISOString(),
            status: 'SCHEDULED',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/admin/match-schedule/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bulkCreateDto)
        .expect(400);
    });
  });
}); 