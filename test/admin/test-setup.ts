import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { User } from '../../src/databases/typeorm/entities';

export interface TestContext {
  app: INestApplication;
  userRepository: Repository<User>;
  accessToken: string;
  testUser: User;
}

export interface TestRepositories {
  userRepository: Repository<User>;
  [key: string]: Repository<any>;
}

/**
 * Creates a test application with proper configuration
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      AppModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  
  return app;
}

/**
 * Creates test repositories for the given entities
 */
export function createTestRepositories(
  app: INestApplication,
  entities: { [key: string]: any }
): TestRepositories {
  const repositories: TestRepositories = {
    userRepository: app.get<Repository<User>>(getRepositoryToken(User)),
  };

  for (const [key, entity] of Object.entries(entities)) {
    repositories[key] = app.get<Repository<any>>(getRepositoryToken(entity));
  }

  return repositories;
}

/**
 * Creates a test user and returns authentication token
 */
export async function createTestUserAndToken(
  app: INestApplication,
  userRepository: Repository<User>
): Promise<{ user: User; token: string }> {
  // Create test user
  const testUser = userRepository.create({
    email: 'admin@test.com',
    password: '$argon2id$v=19$m=65536,t=3,p=4$hash', // This would be hashed in real scenario
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

  return {
    user: testUser,
    token: signinResponse.body.access_token,
  };
}

/**
 * Cleans up all repositories
 */
export async function cleanupRepositories(
  repositories: TestRepositories
): Promise<void> {
  const cleanupPromises = Object.values(repositories).map(repo => repo.clear());
  await Promise.all(cleanupPromises);
}

/**
 * Creates test data for different entities
 */
export const TestData = {
  news: {
    valid: {
      title: 'Test News Article',
      description: 'This is a test news article description',
      content: 'This is the full content of the test news article.',
      status: 'DRAFT' as const,
    },
    invalid: {
      title: '',
      description: 'Test description',
      content: 'Test content',
      status: 'INVALID_STATUS' as any,
    },
  },

  league: {
    valid: {
      title: 'Premier League',
      description: 'Top tier football league',
      logo: 'premier-league-logo.png',
      country: 'England',
      level: 1,
    },
    invalid: {
      title: '',
      description: 'Test description',
      logo: 'test-logo.png',
      country: 'England',
      level: -1,
    },
  },

  club: {
    valid: (leagueId: number) => ({
      name: 'Manchester United',
      description: 'Premier League club',
      logo: 'man-utd-logo.png',
      country: 'England',
      city: 'Manchester',
      founded: 1878,
      leagueId,
    }),
    invalid: {
      name: '',
      description: 'Test description',
      logo: 'test-logo.png',
      country: 'England',
      city: 'Test City',
      founded: -100,
      leagueId: 99999,
    },
  },

  match: {
    valid: (homeClubId: number, awayClubId: number, leagueId: number, stadiumId: number) => ({
      homeClubId,
      awayClubId,
      leagueId,
      stadiumId,
      scheduledDate: new Date('2024-12-25T15:00:00Z').toISOString(),
      status: 'SCHEDULED' as const,
      homeScore: null,
      awayScore: null,
    }),
    invalid: {
      homeClubId: 99999,
      awayClubId: 99998,
      leagueId: 99997,
      stadiumId: 99996,
      scheduledDate: 'invalid-date',
      status: 'INVALID_STATUS' as any,
    },
  },

  stadium: {
    valid: {
      name: 'Old Trafford',
      description: 'Home of Manchester United',
      address: 'Sir Matt Busby Way, Manchester',
      capacity: 74140,
      city: 'Manchester',
      country: 'England',
    },
    invalid: {
      name: '',
      description: 'Test description',
      address: 'Test Address',
      capacity: -1000,
      city: 'Test City',
      country: 'England',
    },
  },

  staff: {
    valid: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      position: 'Coach',
      department: 'Technical',
      hireDate: new Date('2023-01-15').toISOString(),
      salary: 50000,
      status: 'ACTIVE' as const,
    },
    invalid: {
      name: '',
      email: 'invalid-email',
      phone: '+1234567890',
      position: 'Coach',
      department: 'Technical',
      hireDate: new Date('2023-01-15').toISOString(),
      salary: -1000,
      status: 'INVALID_STATUS' as any,
    },
  },

  partner: {
    valid: {
      name: 'Nike',
      description: 'Official sportswear partner',
      logo: 'nike-logo.png',
      website: 'https://www.nike.com',
      contactEmail: 'partnership@nike.com',
      contactPhone: '+1234567890',
      partnershipType: 'SPONSOR' as const,
      startDate: new Date('2023-01-01').toISOString(),
      endDate: new Date('2025-12-31').toISOString(),
      status: 'ACTIVE' as const,
    },
    invalid: {
      name: '',
      description: 'Test description',
      logo: 'test-logo.png',
      website: 'invalid-website',
      contactEmail: 'invalid-email',
      contactPhone: '+1234567890',
      partnershipType: 'INVALID_TYPE' as any,
      startDate: new Date('2023-01-01').toISOString(),
      endDate: new Date('2022-12-31').toISOString(),
      status: 'INVALID_STATUS' as any,
    },
  },

  personal: {
    valid: {
      name: 'Lionel Messi',
      email: 'messi@example.com',
      phone: '+1234567890',
      position: 'Forward',
      nationality: 'Argentina',
      dateOfBirth: new Date('1987-06-24').toISOString(),
      height: 170,
      weight: 72,
      jerseyNumber: 10,
      status: 'ACTIVE' as const,
    },
    invalid: {
      name: '',
      email: 'invalid-email',
      phone: '+1234567890',
      position: 'Forward',
      nationality: 'Argentina',
      dateOfBirth: new Date('1987-06-24').toISOString(),
      height: -170,
      weight: -72,
      jerseyNumber: -10,
      status: 'INVALID_STATUS' as any,
    },
  },
};

/**
 * Common test assertions
 */
export const TestAssertions = {
  /**
   * Asserts that a response contains pagination structure
   */
  assertPaginatedResponse: (response: any) => {
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(response.body).toHaveProperty('links');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.meta.totalItems).toBeGreaterThan(0);
  },

  /**
   * Asserts that a response contains entity properties
   */
  assertEntityResponse: (response: any, entityType: string) => {
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
  },

  /**
   * Asserts that all items in a paginated response match a filter
   */
  assertAllItemsMatchFilter: (response: any, filterKey: string, filterValue: any) => {
    expect(response.body.data.every((item: any) => item[filterKey] === filterValue)).toBe(true);
  },

  /**
   * Asserts that at least one item in a paginated response matches a search term
   */
  assertSomeItemsMatchSearch: (response: any, searchKey: string, searchTerm: string) => {
    expect(response.body.data.some((item: any) => 
      item[searchKey].toLowerCase().includes(searchTerm.toLowerCase())
    )).toBe(true);
  },
};

/**
 * Common test utilities
 */
export const TestUtils = {
  /**
   * Creates a test file for upload tests
   */
  createTestFile: (filename: string, content: string): string => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  },

  /**
   * Cleans up test files
   */
  cleanupTestFile: (filePath: string): void => {
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  },

  /**
   * Waits for a specified amount of time
   */
  wait: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generates a random string
   */
  randomString: (length: number = 10): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generates a random email
   */
  randomEmail: (): string => {
    return `test.${TestUtils.randomString()}@example.com`;
  },
}; 