import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Permissions } from '../../../common/enums/permission.enum';

export class RoleSeeder {
    async run(dataSource: DataSource): Promise<void> {
        const roleRepository = dataSource.getRepository(Role);
        const permissionRepository = dataSource.getRepository(Permission);

        console.log('👥 Seeding roles with permissions...');

        // Define role permission mappings
        const rolePermissionMappings = {
            'SUPER_ADMIN': {
                description: 'Суперадминистратор с полным доступом ко всем функциям системы',
                permissions: Object.values(Permissions) // All permissions
            },
            'ADMIN': {
                description: 'Администратор с правами управления основными модулями',
                permissions: [
                    // Authentication
                    Permissions.AUTH_LOGIN,
                    Permissions.AUTH_LOGOUT,
                    Permissions.AUTH_REFRESH,
                    
                    // User Management
                    Permissions.USER_CREATE,
                    Permissions.USER_READ,
                    Permissions.USER_UPDATE,
                    Permissions.USER_DELETE,
                    
                    // Role Management
                    Permissions.ROLE_READ,
                    Permissions.ROLE_UPDATE,
                    
                    // Permission Management (read only)
                    Permissions.PERMISSION_READ,
                    
                    // Club Management
                    Permissions.CLUB_CREATE,
                    Permissions.CLUB_READ,
                    Permissions.CLUB_UPDATE,
                    Permissions.CLUB_DELETE,
                    
                    // League Management
                    Permissions.LEAGUE_CREATE,
                    Permissions.LEAGUE_READ,
                    Permissions.LEAGUE_UPDATE,
                    Permissions.LEAGUE_DELETE,
                    
                    // League Point Management
                    Permissions.LEAGUE_POINT_CREATE,
                    Permissions.LEAGUE_POINT_READ,
                    Permissions.LEAGUE_POINT_UPDATE,
                    Permissions.LEAGUE_POINT_DELETE,
                    
                    // Match Management
                    Permissions.MATCH_CREATE,
                    Permissions.MATCH_READ,
                    Permissions.MATCH_UPDATE,
                    Permissions.MATCH_DELETE,
                    
                    // Match Score Management
                    Permissions.MATCH_SCORE_CREATE,
                    Permissions.MATCH_SCORE_READ,
                    Permissions.MATCH_SCORE_UPDATE,
                    Permissions.MATCH_SCORE_DELETE,
                    
                    // News Management
                    Permissions.NEWS_CREATE,
                    Permissions.NEWS_READ,
                    Permissions.NEWS_UPDATE,
                    Permissions.NEWS_DELETE,
                    
                    // Partner Management
                    Permissions.PARTNER_CREATE,
                    Permissions.PARTNER_READ,
                    Permissions.PARTNER_UPDATE,
                    Permissions.PARTNER_DELETE,
                    
                    // Personal Management
                    Permissions.PERSONAL_CREATE,
                    Permissions.PERSONAL_READ,
                    Permissions.PERSONAL_UPDATE,
                    Permissions.PERSONAL_DELETE,
                    
                    // Season Management
                    Permissions.SEASON_CREATE,
                    Permissions.SEASON_READ,
                    Permissions.SEASON_UPDATE,
                    Permissions.SEASON_DELETE,
                    
                    // Stadium Management
                    Permissions.STADIUM_CREATE,
                    Permissions.STADIUM_READ,
                    Permissions.STADIUM_UPDATE,
                    Permissions.STADIUM_DELETE,
                    
                    // Staff Management
                    Permissions.STAFF_CREATE,
                    Permissions.STAFF_READ,
                    Permissions.STAFF_UPDATE,
                    Permissions.STAFF_DELETE,
                ]
            },
            'MODER': {
                description: 'Модератор с ограниченными правами на редактирование контента',
                permissions: [
                    // Authentication
                    Permissions.AUTH_LOGIN,
                    Permissions.AUTH_LOGOUT,
                    Permissions.AUTH_REFRESH,
                    
                    // Club Management (read only)
                    Permissions.CLUB_READ,
                    
                    // League Management (read only)
                    Permissions.LEAGUE_READ,
                    
                    // League Point Management (read/update)
                    Permissions.LEAGUE_POINT_READ,
                    Permissions.LEAGUE_POINT_UPDATE,
                    
                    // Match Management (read/update)
                    Permissions.MATCH_READ,
                    Permissions.MATCH_UPDATE,
                    
                    // Match Score Management
                    Permissions.MATCH_SCORE_CREATE,
                    Permissions.MATCH_SCORE_READ,
                    Permissions.MATCH_SCORE_UPDATE,
                    
                    // News Management (full access)
                    Permissions.NEWS_CREATE,
                    Permissions.NEWS_READ,
                    Permissions.NEWS_UPDATE,
                    Permissions.NEWS_DELETE,
                    
                    // Partner Management (read only)
                    Permissions.PARTNER_READ,
                    
                    // Personal Management (read/update)
                    Permissions.PERSONAL_READ,
                    Permissions.PERSONAL_UPDATE,
                    
                    // Season Management (read only)
                    Permissions.SEASON_READ,
                    
                    // Stadium Management (read only)
                    Permissions.STADIUM_READ,
                    
                    // Staff Management (read only)
                    Permissions.STAFF_READ,
                ]
            },
            'EDITOR': {
                description: 'Редактор контента с правами на управление новостями и информацией',
                permissions: [
                    // Authentication
                    Permissions.AUTH_LOGIN,
                    Permissions.AUTH_LOGOUT,
                    Permissions.AUTH_REFRESH,
                    
                    // Club Management (read only)
                    Permissions.CLUB_READ,
                    
                    // League Management (read only)
                    Permissions.LEAGUE_READ,
                    
                    // Match Management (read only)
                    Permissions.MATCH_READ,
                    
                    // News Management (full access)
                    Permissions.NEWS_CREATE,
                    Permissions.NEWS_READ,
                    Permissions.NEWS_UPDATE,
                    Permissions.NEWS_DELETE,
                    
                    // Partner Management (full access)
                    Permissions.PARTNER_CREATE,
                    Permissions.PARTNER_READ,
                    Permissions.PARTNER_UPDATE,
                    Permissions.PARTNER_DELETE,
                    
                    // Personal Management (limited)
                    Permissions.PERSONAL_CREATE,
                    Permissions.PERSONAL_READ,
                    Permissions.PERSONAL_UPDATE,
                    
                    // Stadium Management (read/update)
                    Permissions.STADIUM_READ,
                    Permissions.STADIUM_UPDATE,
                ]
            },
            'VIEWER': {
                description: 'Пользователь с правами только на просмотр',
                permissions: [
                    // Authentication
                    Permissions.AUTH_LOGIN,
                    Permissions.AUTH_LOGOUT,
                    Permissions.AUTH_REFRESH,
                    
                    // Read-only access to main modules
                    Permissions.CLUB_READ,
                    Permissions.LEAGUE_READ,
                    Permissions.LEAGUE_POINT_READ,
                    Permissions.MATCH_READ,
                    Permissions.MATCH_SCORE_READ,
                    Permissions.NEWS_READ,
                    Permissions.PARTNER_READ,
                    Permissions.PERSONAL_READ,
                    Permissions.SEASON_READ,
                    Permissions.STADIUM_READ,
                    Permissions.STAFF_READ,
                ]
            }
        };

        // Create or update roles with their permissions
        for (const [roleName, roleConfig] of Object.entries(rolePermissionMappings)) {
            let role = await roleRepository.findOne({
                where: { name: roleName },
                relations: ['permissions']
            });

            // Create role if it doesn't exist
            if (!role) {
                role = roleRepository.create({ name: roleName });
                role = await roleRepository.save(role);
                console.log(`✅ Created role: ${roleName}`);
            } else {
                console.log(`👥 Role ${roleName} already exists, updating permissions...`);
            }

            // Get all required permissions for this role
            const requiredPermissions = await permissionRepository.find({
                where: roleConfig.permissions.map(permission => ({ name: permission }))
            });

            // Update role permissions
            role.permissions = requiredPermissions;
            await roleRepository.save(role);

            console.log(`🔑 Assigned ${requiredPermissions.length} permissions to role: ${roleName}`);
            console.log(`   Permissions: ${requiredPermissions.map(p => p.name).join(', ')}`);
        }

        console.log('🎉 Role seeding completed!');
    }
}
