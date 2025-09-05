import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { UserSeeder } from './user.seeder';
import { PermissionSeeder } from './permission.seeder';

async function runSeeders() {
  console.log('🚀 Starting database seeding...');
  
  // Initialize the data source
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('📊 Database connection established');

    // Run seeders - permissions first, then users
    const permissionSeeder = new PermissionSeeder();
    await permissionSeeder.run(dataSource);

    const userSeeder = new UserSeeder();
    await userSeeder.run(dataSource);

    console.log('✨ All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run seeders if this file is executed directly
if (require.main === module) {
  runSeeders();
}

export { runSeeders };