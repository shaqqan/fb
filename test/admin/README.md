# Admin Module E2E Tests

This directory contains comprehensive end-to-end (E2E) tests for all functionalities within the Admin module of the football management system.

## Overview

The Admin module consists of the following submodules, each with its own comprehensive E2E test suite:

1. **Authentication (`auth.e2e-spec.ts`)**
   - User signin/signout
   - Token refresh
   - Authentication validation

2. **News Management (`news.e2e-spec.ts`)**
   - CRUD operations for news articles
   - Pagination and filtering
   - Status management (DRAFT, PUBLISHED)

3. **Leagues Management (`leagues.e2e-spec.ts`)**
   - CRUD operations for leagues
   - Hierarchical structure (parent/child leagues)
   - Root leagues and children endpoints
   - Pagination and filtering

4. **Club Management (`club.e2e-spec.ts`)**
   - CRUD operations for clubs
   - League association
   - Pagination and filtering

5. **Match Schedule (`match-schedule.e2e-spec.ts`)**
   - CRUD operations for matches
   - Match status management
   - Bulk match creation
   - Date filtering and sorting

6. **Stadium Management (`stadium.e2e-spec.ts`)**
   - CRUD operations for stadiums
   - Capacity and location management
   - Pagination and filtering

7. **Staff Management (`staff.e2e-spec.ts`)**
   - CRUD operations for staff members
   - Department and position management
   - Salary and status tracking

8. **Partner Management (`partner.e2e-spec.ts`)**
   - CRUD operations for partners
   - Partnership type management
   - Contact information handling

9. **Personal Management (`personal.e2e-spec.ts`)**
   - CRUD operations for personal records
   - Player/Personnel information
   - Physical attributes and statistics

10. **File Upload (`upload.e2e-spec.ts`)**
    - File upload functionality
    - Image and document uploads
    - File validation and size limits

11. **Comprehensive Workflow (`admin-comprehensive.e2e-spec.ts`)**
    - End-to-end workflow testing
    - Cross-module integration
    - Complete CRUD lifecycle

## Test Structure

Each test file follows a consistent structure:

```typescript
describe('Module Name (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<Entity>;
  let accessToken: string;
  let testUser: User;

  beforeAll(async () => {
    // Setup test environment
  });

  beforeEach(async () => {
    // Clean database and create test data
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('POST /admin/endpoint', () => {
    // Create operations
  });

  describe('GET /admin/endpoint', () => {
    // Read operations with pagination
  });

  describe('GET /admin/endpoint/:id', () => {
    // Read single entity
  });

  describe('PATCH /admin/endpoint/:id', () => {
    // Update operations
  });

  describe('DELETE /admin/endpoint/:id', () => {
    // Delete operations
  });
});
```

## Test Coverage

### Authentication Tests
- ✅ Valid credentials signin
- ✅ Invalid credentials rejection
- ✅ Missing credentials validation
- ✅ Token refresh functionality
- ✅ Logout functionality
- ✅ Invalid token rejection

### CRUD Operations
- ✅ Create new entities
- ✅ Read entities (single and paginated)
- ✅ Update existing entities
- ✅ Delete entities
- ✅ Non-existent entity handling

### Validation Tests
- ✅ Required field validation
- ✅ Data type validation
- ✅ Business rule validation
- ✅ Duplicate entry prevention
- ✅ Foreign key constraints

### Pagination & Filtering
- ✅ Pagination with metadata
- ✅ Sorting by various fields
- ✅ Filtering by status, type, etc.
- ✅ Search functionality
- ✅ Date range filtering

### Error Handling
- ✅ 400 Bad Request for invalid data
- ✅ 401 Unauthorized for missing auth
- ✅ 404 Not Found for non-existent resources
- ✅ 403 Forbidden for invalid permissions

### Integration Tests
- ✅ Cross-module relationships
- ✅ Data consistency
- ✅ Workflow completion
- ✅ Bulk operations

## Running the Tests

### Prerequisites

1. **Database Setup**: Ensure you have a test database configured
2. **Environment Variables**: Create a `.env.test` file with test configuration
3. **Dependencies**: Install all required packages

### Environment Configuration

Create a `.env.test` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_DATABASE=test_db

# JWT Configuration
JWT_ACCESS_SECRET=test_access_secret
JWT_REFRESH_SECRET=test_refresh_secret

# File Upload Configuration
UPLOAD_DEST=./uploads/test
MAX_FILE_SIZE=5242880
```

### Running Individual Test Files

```bash
# Run specific module tests
npm run test:e2e -- --testPathPattern=auth.e2e-spec.ts
npm run test:e2e -- --testPathPattern=news.e2e-spec.ts
npm run test:e2e -- --testPathPattern=leagues.e2e-spec.ts

# Run all admin tests
npm run test:e2e -- --testPathPattern=admin
```

### Running All Admin Tests

```bash
# Run all admin module tests
npm run test:e2e -- --testPathPattern=admin

# Run with coverage
npm run test:e2e -- --testPathPattern=admin --coverage

# Run in watch mode
npm run test:e2e -- --testPathPattern=admin --watch
```

### Running Comprehensive Tests

```bash
# Run the comprehensive workflow test
npm run test:e2e -- --testPathPattern=admin-comprehensive.e2e-spec.ts
```

## Test Data Management

### Database Cleanup

Each test file includes proper database cleanup:

```typescript
beforeEach(async () => {
  // Clean up database before each test
  await repository.clear();
  await userRepository.clear();
  
  // Create fresh test data
  testUser = await createTestUser();
  accessToken = await getAccessToken(testUser);
});
```

### Test Data Creation

Test data is created with realistic values:

```typescript
const createNewsDto = {
  title: 'Test News Article',
  description: 'This is a test news article description',
  content: 'This is the full content of the test news article.',
  status: 'DRAFT',
};
```

## Best Practices

### Test Isolation
- Each test is independent and doesn't rely on other tests
- Database is cleaned before each test
- Fresh authentication tokens are generated

### Realistic Data
- Test data mimics real-world scenarios
- Proper relationships between entities
- Valid business rules and constraints

### Error Scenarios
- Tests cover both success and failure cases
- Validation errors are properly tested
- Edge cases are considered

### Performance
- Tests are optimized for speed
- Minimal database operations
- Efficient cleanup procedures

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify database is running
   - Check connection credentials
   - Ensure test database exists

2. **Authentication Failures**
   - Verify JWT secrets are configured
   - Check user creation in tests
   - Ensure password hashing is working

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure proper file types

4. **Validation Errors**
   - Check DTO validation rules
   - Verify entity constraints
   - Review business logic

### Debug Mode

Run tests in debug mode for detailed logging:

```bash
npm run test:e2e -- --testPathPattern=admin --verbose
```

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Include both positive and negative test cases
3. Add proper cleanup in `beforeEach`
4. Document any new test scenarios
5. Ensure tests are independent and repeatable

## Coverage Report

After running tests, check the coverage report:

```bash
npm run test:e2e -- --testPathPattern=admin --coverage --coverageDirectory=coverage/admin
```

This will generate a detailed coverage report showing which parts of the Admin module are tested and which need additional coverage. 