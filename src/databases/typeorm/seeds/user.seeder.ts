import { DataSource } from 'typeorm';
import * as argon from 'argon2';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

export class UserSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Sample users to seed
    const usersToSeed = [
      {
        name: 'Super Administrator',
        email: 'superadmin@kkfa.uz',
        password: 'SuperAdmin123!',
        roles: ['SUPER_ADMIN'],
      },
      {
        name: 'System Administrator',
        email: 'admin@football.com',
        password: 'Admin123!',
        roles: ['ADMIN'],
      },
      {
        name: 'Content Moderator',
        email: 'moderator@football.com',
        password: 'Moderator123!',
        roles: ['MODER'],
      },
      {
        name: 'News Editor',
        email: 'editor@football.com',
        password: 'Editor123!',
        roles: ['EDITOR'],
      },
      {
        name: 'Match Reporter',
        email: 'reporter@football.com',
        password: 'Reporter123!',
        roles: ['MODER', 'EDITOR'],
      },
      {
        name: 'Content Viewer',
        email: 'viewer@football.com',
        password: 'Viewer123!',
        roles: ['VIEWER'],
      },
      // Legacy users for backward compatibility
      {
        name: 'Legacy Admin',
        email: 'admin@example.com',
        password: 'admin123',
        roles: ['ADMIN'],
      },
      {
        name: 'Legacy Moderator',
        email: 'moderator@example.com',
        password: 'moderator123',
        roles: ['MODER'],
      },
    ];

    console.log('🌱 Seeding users...');

    for (const userData of usersToSeed) {
      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`👤 User with email ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash the password
      const hashedPassword = await argon.hash(userData.password);

      // Get roles for this user
      const userRoles: Role[] = [];
      for (const roleName of userData.roles) {
        const role = await roleRepository.findOne({ 
          where: { name: roleName },
          relations: ['permissions']
        });
        if (role) {
          userRoles.push(role);
        } else {
          console.warn(`⚠️ Role ${roleName} not found for user ${userData.email}`);
        }
      }

      if (userRoles.length === 0) {
        console.warn(`⚠️ No valid roles found for user ${userData.email}, skipping...`);
        continue;
      }

      // Create new user
      const user = userRepository.create({
        name: userData.name,
        email: userData.email,
        hash: hashedPassword,
        roles: userRoles,
        hashedRt: null,
      });

      await userRepository.save(user);
      console.log(`✅ Created user: ${userData.name} (${userData.email}) with roles: ${user.roles.map(r => r.name).join(', ')}`);
    }

    console.log('🎉 User seeding completed!');
  }
}