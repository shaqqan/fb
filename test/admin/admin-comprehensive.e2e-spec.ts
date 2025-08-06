import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, News, League, Club, Match, Stadium, Staff, Partner, Personal } from '../src/databases/typeorm/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Admin Module Comprehensive E2E Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let newsRepository: Repository<News>;
  let leagueRepository: Repository<League>;
  let clubRepository: Repository<Club>;
  let matchRepository: Repository<Match>;
  let stadiumRepository: Repository<Stadium>;
  let staffRepository: Repository<Staff>;
  let partnerRepository: Repository<Partner>;
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
    newsRepository = moduleFixture.get<Repository<News>>(getRepositoryToken(News));
    leagueRepository = moduleFixture.get<Repository<League>>(getRepositoryToken(League));
    clubRepository = moduleFixture.get<Repository<Club>>(getRepositoryToken(Club));
    matchRepository = moduleFixture.get<Repository<Match>>(getRepositoryToken(Match));
    stadiumRepository = moduleFixture.get<Repository<Stadium>>(getRepositoryToken(Stadium));
    staffRepository = moduleFixture.get<Repository<Staff>>(getRepositoryToken(Staff));
    partnerRepository = moduleFixture.get<Repository<Partner>>(getRepositoryToken(Partner));
    personalRepository = moduleFixture.get<Repository<Personal>>(getRepositoryToken(Personal));
  });

  beforeEach(async () => {
    // Clean up all databases before each test
    await personalRepository.clear();
    await partnerRepository.clear();
    await staffRepository.clear();
    await stadiumRepository.clear();
    await matchRepository.clear();
    await clubRepository.clear();
    await leagueRepository.clear();
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

  describe('Complete Admin Module Workflow', () => {
    it('should perform complete CRUD operations across all Admin modules', async () => {
      // 1. Create a league
      const leagueResponse = await request(app.getHttpServer())
        .post('/admin/leagues')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Premier League',
          description: 'Top tier football league',
          logo: 'premier-league-logo.png',
          country: 'England',
          level: 1,
        })
        .expect(201);

      const leagueId = leagueResponse.body.id;

      // 2. Create a stadium
      const stadiumResponse = await request(app.getHttpServer())
        .post('/admin/stadium')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Old Trafford',
          description: 'Home of Manchester United',
          address: 'Sir Matt Busby Way, Manchester',
          capacity: 74140,
          city: 'Manchester',
          country: 'England',
        })
        .expect(201);

      const stadiumId = stadiumResponse.body.id;

      // 3. Create a club
      const clubResponse = await request(app.getHttpServer())
        .post('/admin/club')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Manchester United',
          description: 'Premier League club',
          logo: 'man-utd-logo.png',
          country: 'England',
          city: 'Manchester',
          founded: 1878,
          leagueId: leagueId,
        })
        .expect(201);

      const clubId = clubResponse.body.id;

      // 4. Create another club for match scheduling
      const awayClubResponse = await request(app.getHttpServer())
        .post('/admin/club')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Liverpool FC',
          description: 'Premier League club',
          logo: 'liverpool-logo.png',
          country: 'England',
          city: 'Liverpool',
          founded: 1892,
          leagueId: leagueId,
        })
        .expect(201);

      const awayClubId = awayClubResponse.body.id;

      // 5. Create a match
      const matchResponse = await request(app.getHttpServer())
        .post('/admin/match-schedule')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          homeClubId: clubId,
          awayClubId: awayClubId,
          leagueId: leagueId,
          stadiumId: stadiumId,
          scheduledDate: new Date('2024-12-25T15:00:00Z').toISOString(),
          status: 'SCHEDULED',
          homeScore: null,
          awayScore: null,
        })
        .expect(201);

      const matchId = matchResponse.body.id;

      // 6. Create a news article
      const newsResponse = await request(app.getHttpServer())
        .post('/admin/news')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Match Preview: Manchester United vs Liverpool',
          description: 'Preview of the upcoming match between Manchester United and Liverpool',
          content: 'This is a comprehensive preview of the match...',
          status: 'PUBLISHED',
        })
        .expect(201);

      const newsId = newsResponse.body.id;

      // 7. Create a staff member
      const staffResponse = await request(app.getHttpServer())
        .post('/admin/staff')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          position: 'Coach',
          department: 'Technical',
          hireDate: new Date('2023-01-15').toISOString(),
          salary: 50000,
          status: 'ACTIVE',
        })
        .expect(201);

      const staffId = staffResponse.body.id;

      // 8. Create a partner
      const partnerResponse = await request(app.getHttpServer())
        .post('/admin/partner')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Nike',
          description: 'Official sportswear partner',
          logo: 'nike-logo.png',
          website: 'https://www.nike.com',
          contactEmail: 'partnership@nike.com',
          contactPhone: '+1234567890',
          partnershipType: 'SPONSOR',
          startDate: new Date('2023-01-01').toISOString(),
          endDate: new Date('2025-12-31').toISOString(),
          status: 'ACTIVE',
        })
        .expect(201);

      const partnerId = partnerResponse.body.id;

      // 9. Create a personal record
      const personalResponse = await request(app.getHttpServer())
        .post('/admin/personal')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
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
        })
        .expect(201);

      const personalId = personalResponse.body.id;

      // 10. Verify all entities were created by retrieving them
      await request(app.getHttpServer())
        .get(`/admin/leagues/${leagueId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/admin/stadium/${stadiumId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/admin/club/${clubId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/admin/match-schedule/${matchId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/admin/news/${newsId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/admin/staff/${staffId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/admin/partner/${partnerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/admin/personal/${personalId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 11. Update some entities
      await request(app.getHttpServer())
        .patch(`/admin/news/${newsId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Match Preview: Manchester United vs Liverpool',
          status: 'DRAFT',
        })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/admin/match-schedule/${matchId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'IN_PROGRESS',
          homeScore: 1,
          awayScore: 0,
        })
        .expect(200);

      // 12. Test pagination and filtering
      const leaguesResponse = await request(app.getHttpServer())
        .get('/admin/leagues')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(leaguesResponse.body.data.length).toBeGreaterThan(0);

      const clubsResponse = await request(app.getHttpServer())
        .get(`/admin/club?filter.leagueId=${leagueId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(clubsResponse.body.data.length).toBe(2);

      const matchesResponse = await request(app.getHttpServer())
        .get(`/admin/match-schedule?filter.leagueId=${leagueId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(matchesResponse.body.data.length).toBe(1);

      // 13. Test search functionality
      const searchResponse = await request(app.getHttpServer())
        .get('/admin/news?search=Manchester')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(searchResponse.body.data.length).toBeGreaterThan(0);

      // 14. Clean up by deleting entities (optional - for cleanup testing)
      await request(app.getHttpServer())
        .delete(`/admin/personal/${personalId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/admin/partner/${partnerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/admin/staff/${staffId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/admin/news/${newsId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/admin/match-schedule/${matchId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/admin/club/${clubId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/admin/club/${awayClubId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/admin/stadium/${stadiumId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/admin/leagues/${leagueId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should handle authentication and authorization properly', async () => {
      // Test that unauthenticated requests are rejected
      await request(app.getHttpServer())
        .post('/admin/news')
        .send({
          title: 'Test News',
          description: 'Test description',
          content: 'Test content',
          status: 'DRAFT',
        })
        .expect(401);

      await request(app.getHttpServer())
        .get('/admin/leagues')
        .expect(401);

      // Test that invalid tokens are rejected
      await request(app.getHttpServer())
        .post('/admin/news')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          title: 'Test News',
          description: 'Test description',
          content: 'Test content',
          status: 'DRAFT',
        })
        .expect(401);
    });

    it('should handle validation errors properly', async () => {
      // Test invalid data for news creation
      await request(app.getHttpServer())
        .post('/admin/news')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '', // Invalid: empty title
          description: 'Test description',
          content: 'Test content',
          status: 'INVALID_STATUS', // Invalid status
        })
        .expect(400);

      // Test invalid data for league creation
      await request(app.getHttpServer())
        .post('/admin/leagues')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '', // Invalid: empty title
          description: 'Test description',
          logo: 'test-logo.png',
          country: 'England',
          level: -1, // Invalid: negative level
        })
        .expect(400);

      // Test invalid data for club creation
      await request(app.getHttpServer())
        .post('/admin/club')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '', // Invalid: empty name
          description: 'Test description',
          logo: 'test-logo.png',
          country: 'England',
          city: 'Test City',
          founded: -100, // Invalid: negative year
          leagueId: 99999, // Invalid: non-existent league
        })
        .expect(400);
    });
  });
}); 