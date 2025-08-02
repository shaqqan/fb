import { DataSource } from 'typeorm';
import * as argon from 'argon2';
import { User } from '../entities/user.entity';
import { Role } from '../entities/enums';

export class UserSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // Sample users to seed
    const usersToSeed = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: Role.ADMIN,
      },
      {
        name: 'Moderator User',
        email: 'moderator@example.com',
        password: 'moderator123',
        role: Role.MODER,
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: Role.MODER,
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: Role.ADMIN,
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

      // Create new user
      const user = userRepository.create({
        name: userData.name,
        email: userData.email,
        hash: hashedPassword,
        role: userData.role,
        hashedRt: null,
      });

      await userRepository.save(user);
      console.log(`✅ Created user: ${userData.name} (${userData.email}) with role: ${userData.role}`);
    }

    console.log('🎉 User seeding completed!');
  }
}
