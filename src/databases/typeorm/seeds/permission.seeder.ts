import { DataSource } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Permissions } from '../../../common/enums/permission.enum';

export class PermissionSeeder {
    async run(dataSource: DataSource): Promise<void> {
        const permissionRepository = dataSource.getRepository(Permission);

        console.log('🔑 Seeding permissions...');

        // Define permissions with descriptions
        const permissionsToSeed = [
            // User Management
            { name: Permissions.USER_CREATE, description: 'Создание новых пользователей в системе' },
            { name: Permissions.USER_READ, description: 'Просмотр информации о пользователях и списка пользователей' },
            { name: Permissions.USER_UPDATE, description: 'Обновление информации и настроек пользователей' },
            { name: Permissions.USER_DELETE, description: 'Удаление пользователей из системы' },

            // Role Management
            { name: Permissions.ROLE_CREATE, description: 'Создание новых ролей и назначение прав' },
            { name: Permissions.ROLE_READ, description: 'Просмотр ролей и их прав' },
            { name: Permissions.ROLE_UPDATE, description: 'Обновление информации о ролях и их правах' },
            { name: Permissions.ROLE_DELETE, description: 'Удаление ролей из системы' },

            // Permission Management
            { name: Permissions.PERMISSION_CREATE, description: 'Создание новых прав доступа' },
            { name: Permissions.PERMISSION_READ, description: 'Просмотр списка прав доступа' },
            { name: Permissions.PERMISSION_UPDATE, description: 'Обновление информации о правах доступа' },
            { name: Permissions.PERMISSION_DELETE, description: 'Удаление прав доступа' },

            // Club Management
            { name: Permissions.CLUB_CREATE, description: 'Создание новых футбольных клубов' },
            { name: Permissions.CLUB_READ, description: 'Просмотр информации и деталей клуба' },
            { name: Permissions.CLUB_UPDATE, description: 'Обновление информации и настроек клуба' },
            { name: Permissions.CLUB_DELETE, description: 'Удаление клубов из системы' },

            // League Management
            { name: Permissions.LEAGUE_CREATE, description: 'Создание новых лиг' },
            { name: Permissions.LEAGUE_READ, description: 'Просмотр информации о лигах и турнирной таблицы' },
            { name: Permissions.LEAGUE_UPDATE, description: 'Обновление информации и настроек лиг' },
            { name: Permissions.LEAGUE_DELETE, description: 'Удаление лиг из системы' },

            // League Point Management
            { name: Permissions.LEAGUE_POINT_CREATE, description: 'Создание записей о турнирных очках' },
            { name: Permissions.LEAGUE_POINT_READ, description: 'Просмотр турнирных очков и таблицы' },
            { name: Permissions.LEAGUE_POINT_UPDATE, description: 'Обновление расчетов турнирных очков' },
            { name: Permissions.LEAGUE_POINT_DELETE, description: 'Удаление записей о турнирных очках' },

            // Match Management
            { name: Permissions.MATCH_CREATE, description: 'Назначение новых матчей' },
            { name: Permissions.MATCH_READ, description: 'Просмотр информации о матчах и расписания' },
            { name: Permissions.MATCH_UPDATE, description: 'Обновление деталей и расписания матчей' },
            { name: Permissions.MATCH_DELETE, description: 'Отмена или удаление матчей' },

            // Match Score Management
            { name: Permissions.MATCH_SCORE_CREATE, description: 'Добавление результатов и счетов матчей' },
            { name: Permissions.MATCH_SCORE_READ, description: 'Просмотр счетов и статистики матчей' },
            { name: Permissions.MATCH_SCORE_UPDATE, description: 'Обновление результатов и счетов матчей' },
            { name: Permissions.MATCH_SCORE_DELETE, description: 'Удаление записей о результатах матчей' },

            // News Management
            { name: Permissions.NEWS_CREATE, description: 'Создание и публикация новостей' },
            { name: Permissions.NEWS_READ, description: 'Просмотр новостей и контента' },
            { name: Permissions.NEWS_UPDATE, description: 'Редактирование и обновление новостей' },
            { name: Permissions.NEWS_DELETE, description: 'Удаление новостей' },

            // Partner Management
            { name: Permissions.PARTNER_CREATE, description: 'Добавление новых партнеров и спонсоров' },
            { name: Permissions.PARTNER_READ, description: 'Просмотр информации о партнерах' },
            { name: Permissions.PARTNER_UPDATE, description: 'Обновление данных и контрактов партнеров' },
            { name: Permissions.PARTNER_DELETE, description: 'Удаление партнеров из системы' },

            // Personal Management
            { name: Permissions.PERSONAL_CREATE, description: 'Добавление персонала/игроков' },
            { name: Permissions.PERSONAL_READ, description: 'Просмотр информации и профилей персонала' },
            { name: Permissions.PERSONAL_UPDATE, description: 'Обновление информации о персонале' },
            { name: Permissions.PERSONAL_DELETE, description: 'Удаление записей о персонале' },

            // Season Management
            { name: Permissions.SEASON_CREATE, description: 'Создание новых футбольных сезонов' },
            { name: Permissions.SEASON_READ, description: 'Просмотр информации и расписания сезона' },
            { name: Permissions.SEASON_UPDATE, description: 'Обновление деталей и настроек сезона' },
            { name: Permissions.SEASON_DELETE, description: 'Удаление записей о сезоне' },

            // Stadium Management
            { name: Permissions.STADIUM_CREATE, description: 'Добавление новых стадионов и арен' },
            { name: Permissions.STADIUM_READ, description: 'Просмотр информации и деталей стадиона' },
            { name: Permissions.STADIUM_UPDATE, description: 'Обновление информации и характеристик стадиона' },
            { name: Permissions.STADIUM_DELETE, description: 'Удаление записей о стадионах' },

            // Staff Management
            { name: Permissions.STAFF_CREATE, description: 'Добавление новых сотрудников' },
            { name: Permissions.STAFF_READ, description: 'Просмотр информации о сотрудниках и их ролях' },
            { name: Permissions.STAFF_UPDATE, description: 'Обновление данных и назначений сотрудников' },
            { name: Permissions.STAFF_DELETE, description: 'Удаление сотрудников из системы' },
        ];

        // Create permissions that don't exist
        for (const permissionData of permissionsToSeed) {
            const existingPermission = await permissionRepository.findOne({
                where: { name: permissionData.name },
            });

            if (existingPermission) {
                console.log(`🔑 Permission ${permissionData.name} already exists, skipping...`);
                continue;
            }

            const permission = permissionRepository.create({
                name: permissionData.name,
                description: permissionData.description,
            });

            await permissionRepository.save(permission);
            console.log(`✅ Created permission: ${permissionData.name}`);
        }

        console.log('🎉 Permission seeding completed!');
    }
}
