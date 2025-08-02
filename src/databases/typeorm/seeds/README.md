# Database Seeders

This directory contains database seeders for populating initial data.

## Available Seeders

### UserSeeder
Creates initial users with different roles:
- **Admin User** (admin@example.com) - ADMIN role
- **Moderator User** (moderator@example.com) - MODER role  
- **John Doe** (john.doe@example.com) - MODER role
- **Jane Smith** (jane.smith@example.com) - ADMIN role

All users are created with hashed passwords using argon2.

## Usage

### Prerequisites
1. Make sure your database is running
2. Update your `.env` file with correct database credentials
3. Ensure your database exists

### Running Seeders

```bash
# Run all seeders
npm run seed
```

### Default Credentials
- **Admin**: admin@example.com / admin123
- **Moderator**: moderator@example.com / moderator123
- **John Doe**: john.doe@example.com / password123
- **Jane Smith**: jane.smith@example.com / password123

## Adding New Seeders

1. Create a new seeder class in this directory
2. Implement the `run(dataSource: DataSource)` method
3. Add the seeder to `main.seeder.ts`
4. Export it from `index.ts`

## Notes

- Seeders check for existing records to prevent duplicates
- Passwords are properly hashed using argon2
- The seeder will skip users that already exist in the database