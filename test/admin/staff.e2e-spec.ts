import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, Staff } from '../src/databases/typeorm/entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Admin Staff (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let staffRepository: Repository<Staff>;
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
    staffRepository = moduleFixture.get<Repository<Staff>>(getRepositoryToken(Staff));
  });

  beforeEach(async () => {
    // Clean up database before each test
    await staffRepository.clear();
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

  describe('/admin/staff (POST)', () => {
    it('should create a new staff member', async () => {
      const createStaffDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        position: 'Coach',
        department: 'Technical',
        hireDate: new Date('2023-01-15').toISOString(),
        salary: 50000,
        status: 'ACTIVE',
      };

      const response = await request(app.getHttpServer())
        .post('/admin/staff')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createStaffDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createStaffDto.name);
      expect(response.body.email).toBe(createStaffDto.email);
      expect(response.body.phone).toBe(createStaffDto.phone);
      expect(response.body.position).toBe(createStaffDto.position);
      expect(response.body.department).toBe(createStaffDto.department);
      expect(response.body.salary).toBe(createStaffDto.salary);
      expect(response.body.status).toBe(createStaffDto.status);
    });

    it('should fail to create staff without authentication', async () => {
      const createStaffDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        position: 'Coach',
        department: 'Technical',
        hireDate: new Date('2023-01-15').toISOString(),
        salary: 50000,
        status: 'ACTIVE',
      };

      await request(app.getHttpServer())
        .post('/admin/staff')
        .send(createStaffDto)
        .expect(401);
    });

    it('should fail to create staff with invalid data', async () => {
      const createStaffDto = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid email format
        phone: '+1234567890',
        position: 'Coach',
        department: 'Technical',
        hireDate: new Date('2023-01-15').toISOString(),
        salary: -1000, // Invalid: negative salary
        status: 'INVALID_STATUS', // Invalid status
      };

      await request(app.getHttpServer())
        .post('/admin/staff')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createStaffDto)
        .expect(400);
    });

    it('should fail to create staff with duplicate email', async () => {
      // First create a staff member
      await staffRepository.save(
        staffRepository.create({
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '+1234567891',
          position: 'Manager',
          department: 'Administration',
          hireDate: new Date('2023-01-15'),
          salary: 60000,
          status: 'ACTIVE',
        })
      );

      // Try to create another staff member with the same email
      const createStaffDto = {
        name: 'John Doe',
        email: 'jane.doe@example.com', // Duplicate email
        phone: '+1234567890',
        position: 'Coach',
        department: 'Technical',
        hireDate: new Date('2023-01-15').toISOString(),
        salary: 50000,
        status: 'ACTIVE',
      };

      await request(app.getHttpServer())
        .post('/admin/staff')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createStaffDto)
        .expect(400);
    });
  });

  describe('/admin/staff (GET)', () => {
    beforeEach(async () => {
      // Create test staff members
      const staffMembers = [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          position: 'Coach',
          department: 'Technical',
          hireDate: new Date('2023-01-15'),
          salary: 50000,
          status: 'ACTIVE',
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567891',
          position: 'Manager',
          department: 'Administration',
          hireDate: new Date('2023-02-15'),
          salary: 60000,
          status: 'ACTIVE',
        },
        {
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          phone: '+1234567892',
          position: 'Analyst',
          department: 'Analysis',
          hireDate: new Date('2023-03-15'),
          salary: 45000,
          status: 'INACTIVE',
        },
      ];

      for (const staff of staffMembers) {
        await staffRepository.save(staffRepository.create(staff));
      }
    });

    it('should get all staff members with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/staff')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('links');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.totalItems).toBeGreaterThan(0);
    });

    it('should filter staff by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/staff?filter.status=ACTIVE')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((staff: Staff) => staff.status === 'ACTIVE')).toBe(true);
    });

    it('should filter staff by department', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/staff?filter.department=Technical')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((staff: Staff) => staff.department === 'Technical')).toBe(true);
    });

    it('should search staff by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/staff?search=John')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.some((staff: Staff) => staff.name.includes('John'))).toBe(true);
    });

    it('should search staff by email', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/staff?search=jane.smith')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.some((staff: Staff) => staff.email.includes('jane.smith'))).toBe(true);
    });

    it('should sort staff by hire date', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/staff?sortBy=hireDate:ASC')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const hireDates = response.body.data.map((staff: Staff) => new Date(staff.hireDate));
      const sortedDates = [...hireDates].sort((a, b) => a.getTime() - b.getTime());
      expect(hireDates).toEqual(sortedDates);
    });

    it('should sort staff by salary', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/staff?sortBy=salary:DESC')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const salaries = response.body.data.map((staff: Staff) => staff.salary);
      const sortedSalaries = [...salaries].sort((a, b) => b - a);
      expect(salaries).toEqual(sortedSalaries);
    });
  });

  describe('/admin/staff/:id (GET)', () => {
    let testStaff: Staff;

    beforeEach(async () => {
      testStaff = await staffRepository.save(
        staffRepository.create({
          name: 'Test Staff',
          email: 'test.staff@example.com',
          phone: '+1234567899',
          position: 'Test Position',
          department: 'Test Department',
          hireDate: new Date('2023-01-15'),
          salary: 50000,
          status: 'ACTIVE',
        })
      );
    });

    it('should get staff member by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/staff/${testStaff.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(testStaff.id);
      expect(response.body.name).toBe(testStaff.name);
      expect(response.body.email).toBe(testStaff.email);
      expect(response.body.phone).toBe(testStaff.phone);
      expect(response.body.position).toBe(testStaff.position);
      expect(response.body.department).toBe(testStaff.department);
      expect(response.body.salary).toBe(testStaff.salary);
      expect(response.body.status).toBe(testStaff.status);
    });

    it('should return 404 for non-existent staff member', async () => {
      await request(app.getHttpServer())
        .get('/admin/staff/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/admin/staff/:id (PATCH)', () => {
    let testStaff: Staff;

    beforeEach(async () => {
      testStaff = await staffRepository.save(
        staffRepository.create({
          name: 'Original Staff Name',
          email: 'original.staff@example.com',
          phone: '+1234567899',
          position: 'Original Position',
          department: 'Original Department',
          hireDate: new Date('2023-01-15'),
          salary: 50000,
          status: 'ACTIVE',
        })
      );
    });

    it('should update staff member', async () => {
      const updateStaffDto = {
        name: 'Updated Staff Name',
        position: 'Updated Position',
        department: 'Updated Department',
        salary: 55000,
        status: 'INACTIVE',
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/staff/${testStaff.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStaffDto)
        .expect(200);

      expect(response.body.name).toBe(updateStaffDto.name);
      expect(response.body.position).toBe(updateStaffDto.position);
      expect(response.body.department).toBe(updateStaffDto.department);
      expect(response.body.salary).toBe(updateStaffDto.salary);
      expect(response.body.status).toBe(updateStaffDto.status);
      expect(response.body.email).toBe(testStaff.email); // Should remain unchanged
      expect(response.body.phone).toBe(testStaff.phone); // Should remain unchanged
    });

    it('should fail to update non-existent staff member', async () => {
      const updateStaffDto = {
        name: 'Updated Staff Name',
      };

      await request(app.getHttpServer())
        .patch('/admin/staff/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStaffDto)
        .expect(404);
    });

    it('should fail to update with invalid data', async () => {
      const updateStaffDto = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid email format
        salary: -1000, // Invalid: negative salary
      };

      await request(app.getHttpServer())
        .patch(`/admin/staff/${testStaff.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStaffDto)
        .expect(400);
    });
  });

  describe('/admin/staff/:id (DELETE)', () => {
    let testStaff: Staff;

    beforeEach(async () => {
      testStaff = await staffRepository.save(
        staffRepository.create({
          name: 'Staff to Delete',
          email: 'delete.staff@example.com',
          phone: '+1234567899',
          position: 'Test Position',
          department: 'Test Department',
          hireDate: new Date('2023-01-15'),
          salary: 50000,
          status: 'ACTIVE',
        })
      );
    });

    it('should delete staff member', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/staff/${testStaff.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify the staff member is deleted
      await request(app.getHttpServer())
        .get(`/admin/staff/${testStaff.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to delete non-existent staff member', async () => {
      await request(app.getHttpServer())
        .delete('/admin/staff/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
}); 