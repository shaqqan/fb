import { DataSource } from 'typeorm';
import * as argon from 'argon2';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RoleEnum } from '../entities/enums';

export class UserSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Sample users to seed
    const usersToSeed = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: RoleEnum.ADMIN,
      },
      {
        name: 'Moderator User',
        email: 'moderator@example.com',
        password: 'moderator123',
        role: RoleEnum.MODER,
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: RoleEnum.MODER,
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: RoleEnum.ADMIN,
      },
    ];

    console.log('🌱 Ensuring roles exist...');

    // Ensure required roles exist
    const roleNames: string[] = [RoleEnum.ADMIN, RoleEnum.MODER];
    const nameToRole = new Map<string, Role>();

    for (const name of roleNames) {
      let role = await roleRepository.findOne({ where: { name } });
      if (!role) {
        role = roleRepository.create({ name });
        role = await roleRepository.save(role);
        console.log(`✅ Created role: ${name}`);
      }
      nameToRole.set(name, role);
    }

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

      // Map RoleEnum to Role entity 
      const roleEntity = nameToRole.get(userData.role);
      if (!roleEntity) {
        throw new Error(`Role ${userData.role} was not found or created`);
      }

      // Create new user
      const user = userRepository.create({
        name: userData.name,
        email: userData.email,
        hash: hashedPassword,
        roles: [roleEntity],
        hashedRt: null,
      });

      await userRepository.save(user);
      console.log(`✅ Created user: ${userData.name} (${userData.email}) with roles: ${user.roles.map(r => r.name).join(', ')}`);
    }

    console.log('🎉 User seeding completed!');
  }
}
