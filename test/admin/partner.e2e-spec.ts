import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, Partner } from '../src/databases/typeorm/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Admin Partner (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let partnerRepository: Repository<Partner>;
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
    partnerRepository = moduleFixture.get<Repository<Partner>>(getRepositoryToken(Partner));
  });

  beforeEach(async () => {
    // Clean up database before each test
    await partnerRepository.clear();
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

  describe('/admin/partner (POST)', () => {
    it('should create a new partner', async () => {
      const createPartnerDto = {
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
      };

      const response = await request(app.getHttpServer())
        .post('/admin/partner')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPartnerDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createPartnerDto.name);
      expect(response.body.description).toBe(createPartnerDto.description);
      expect(response.body.logo).toBe(createPartnerDto.logo);
      expect(response.body.website).toBe(createPartnerDto.website);
      expect(response.body.contactEmail).toBe(createPartnerDto.contactEmail);
      expect(response.body.contactPhone).toBe(createPartnerDto.contactPhone);
      expect(response.body.partnershipType).toBe(createPartnerDto.partnershipType);
      expect(response.body.status).toBe(createPartnerDto.status);
    });

    it('should fail to create partner without authentication', async () => {
      const createPartnerDto = {
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
      };

      await request(app.getHttpServer())
        .post('/admin/partner')
        .send(createPartnerDto)
        .expect(401);
    });

    it('should fail to create partner with invalid data', async () => {
      const createPartnerDto = {
        name: '', // Invalid: empty name
        description: 'Official sportswear partner',
        logo: 'nike-logo.png',
        website: 'invalid-website', // Invalid URL
        contactEmail: 'invalid-email', // Invalid email
        contactPhone: '+1234567890',
        partnershipType: 'INVALID_TYPE', // Invalid partnership type
        startDate: new Date('2023-01-01').toISOString(),
        endDate: new Date('2022-12-31').toISOString(), // Invalid: end date before start date
        status: 'INVALID_STATUS', // Invalid status
      };

      await request(app.getHttpServer())
        .post('/admin/partner')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPartnerDto)
        .expect(400);
    });

    it('should fail to create partner with duplicate name', async () => {
      // First create a partner
      await partnerRepository.save(
        partnerRepository.create({
          name: 'Nike',
          description: 'Official sportswear partner',
          logo: 'nike-logo.png',
          website: 'https://www.nike.com',
          contactEmail: 'partnership@nike.com',
          contactPhone: '+1234567890',
          partnershipType: 'SPONSOR',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2025-12-31'),
          status: 'ACTIVE',
        })
      );

      // Try to create another partner with the same name
      const createPartnerDto = {
        name: 'Nike', // Duplicate name
        description: 'Another Nike partnership',
        logo: 'nike-logo-2.png',
        website: 'https://www.nike.com/partnership',
        contactEmail: 'partnership2@nike.com',
        contactPhone: '+1234567891',
        partnershipType: 'SPONSOR',
        startDate: new Date('2023-01-01').toISOString(),
        endDate: new Date('2025-12-31').toISOString(),
        status: 'ACTIVE',
      };

      await request(app.getHttpServer())
        .post('/admin/partner')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPartnerDto)
        .expect(400);
    });
  });

  describe('/admin/partner (GET)', () => {
    beforeEach(async () => {
      // Create test partners
      const partners = [
        {
          name: 'Nike',
          description: 'Official sportswear partner',
          logo: 'nike-logo.png',
          website: 'https://www.nike.com',
          contactEmail: 'partnership@nike.com',
          contactPhone: '+1234567890',
          partnershipType: 'SPONSOR',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2025-12-31'),
          status: 'ACTIVE',
        },
        {
          name: 'Adidas',
          description: 'Official equipment partner',
          logo: 'adidas-logo.png',
          website: 'https://www.adidas.com',
          contactEmail: 'partnership@adidas.com',
          contactPhone: '+1234567891',
          partnershipType: 'SPONSOR',
          startDate: new Date('2023-02-01'),
          endDate: new Date('2026-01-31'),
          status: 'ACTIVE',
        },
        {
          name: 'Coca-Cola',
          description: 'Official beverage partner',
          logo: 'coca-cola-logo.png',
          website: 'https://www.coca-cola.com',
          contactEmail: 'partnership@coca-cola.com',
          contactPhone: '+1234567892',
          partnershipType: 'SPONSOR',
          startDate: new Date('2023-03-01'),
          endDate: new Date('2024-02-29'),
          status: 'INACTIVE',
        },
      ];

      for (const partner of partners) {
        await partnerRepository.save(partnerRepository.create(partner));
      }
    });

    it('should get all partners with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/partner')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('links');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.totalItems).toBeGreaterThan(0);
    });

    it('should filter partners by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/partner?filter.status=ACTIVE')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((partner: Partner) => partner.status === 'ACTIVE')).toBe(true);
    });

    it('should filter partners by partnership type', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/partner?filter.partnershipType=SPONSOR')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((partner: Partner) => partner.partnershipType === 'SPONSOR')).toBe(true);
    });

    it('should search partners by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/partner?search=Nike')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.some((partner: Partner) => partner.name.includes('Nike'))).toBe(true);
    });

    it('should search partners by description', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/partner?search=sportswear')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.some((partner: Partner) => partner.description.includes('sportswear'))).toBe(true);
    });

    it('should sort partners by start date', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/partner?sortBy=startDate:ASC')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const startDates = response.body.data.map((partner: Partner) => new Date(partner.startDate));
      const sortedDates = [...startDates].sort((a, b) => a.getTime() - b.getTime());
      expect(startDates).toEqual(sortedDates);
    });

    it('should sort partners by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/partner?sortBy=name:ASC')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const names = response.body.data.map((partner: Partner) => partner.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });
  });

  describe('/admin/partner/:id (GET)', () => {
    let testPartner: Partner;

    beforeEach(async () => {
      testPartner = await partnerRepository.save(
        partnerRepository.create({
          name: 'Test Partner',
          description: 'Test partner description',
          logo: 'test-logo.png',
          website: 'https://www.test.com',
          contactEmail: 'test@test.com',
          contactPhone: '+1234567899',
          partnershipType: 'SPONSOR',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2025-12-31'),
          status: 'ACTIVE',
        })
      );
    });

    it('should get partner by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/partner/${testPartner.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(testPartner.id);
      expect(response.body.name).toBe(testPartner.name);
      expect(response.body.description).toBe(testPartner.description);
      expect(response.body.logo).toBe(testPartner.logo);
      expect(response.body.website).toBe(testPartner.website);
      expect(response.body.contactEmail).toBe(testPartner.contactEmail);
      expect(response.body.contactPhone).toBe(testPartner.contactPhone);
      expect(response.body.partnershipType).toBe(testPartner.partnershipType);
      expect(response.body.status).toBe(testPartner.status);
    });

    it('should return 404 for non-existent partner', async () => {
      await request(app.getHttpServer())
        .get('/admin/partner/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/admin/partner/:id (PATCH)', () => {
    let testPartner: Partner;

    beforeEach(async () => {
      testPartner = await partnerRepository.save(
        partnerRepository.create({
          name: 'Original Partner Name',
          description: 'Original description',
          logo: 'original-logo.png',
          website: 'https://www.original.com',
          contactEmail: 'original@original.com',
          contactPhone: '+1234567899',
          partnershipType: 'SPONSOR',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2025-12-31'),
          status: 'ACTIVE',
        })
      );
    });

    it('should update partner', async () => {
      const updatePartnerDto = {
        name: 'Updated Partner Name',
        description: 'Updated description',
        website: 'https://www.updated.com',
        contactEmail: 'updated@updated.com',
        status: 'INACTIVE',
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/partner/${testPartner.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePartnerDto)
        .expect(200);

      expect(response.body.name).toBe(updatePartnerDto.name);
      expect(response.body.description).toBe(updatePartnerDto.description);
      expect(response.body.website).toBe(updatePartnerDto.website);
      expect(response.body.contactEmail).toBe(updatePartnerDto.contactEmail);
      expect(response.body.status).toBe(updatePartnerDto.status);
      expect(response.body.logo).toBe(testPartner.logo); // Should remain unchanged
      expect(response.body.contactPhone).toBe(testPartner.contactPhone); // Should remain unchanged
      expect(response.body.partnershipType).toBe(testPartner.partnershipType); // Should remain unchanged
    });

    it('should fail to update non-existent partner', async () => {
      const updatePartnerDto = {
        name: 'Updated Partner Name',
      };

      await request(app.getHttpServer())
        .patch('/admin/partner/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePartnerDto)
        .expect(404);
    });

    it('should fail to update with invalid data', async () => {
      const updatePartnerDto = {
        name: '', // Invalid: empty name
        website: 'invalid-website', // Invalid URL
        contactEmail: 'invalid-email', // Invalid email
      };

      await request(app.getHttpServer())
        .patch(`/admin/partner/${testPartner.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePartnerDto)
        .expect(400);
    });
  });

  describe('/admin/partner/:id (DELETE)', () => {
    let testPartner: Partner;

    beforeEach(async () => {
      testPartner = await partnerRepository.save(
        partnerRepository.create({
          name: 'Partner to Delete',
          description: 'Description',
          logo: 'logo.png',
          website: 'https://www.delete.com',
          contactEmail: 'delete@delete.com',
          contactPhone: '+1234567899',
          partnershipType: 'SPONSOR',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2025-12-31'),
          status: 'ACTIVE',
        })
      );
    });

    it('should delete partner', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/partner/${testPartner.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify the partner is deleted
      await request(app.getHttpServer())
        .get(`/admin/partner/${testPartner.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to delete non-existent partner', async () => {
      await request(app.getHttpServer())
        .delete('/admin/partner/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
}); 