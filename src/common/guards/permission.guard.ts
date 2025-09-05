import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { PERMISSIONS_KEY } from '../constants';
import { Permission } from 'src/databases/typeorm/entities';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18n: I18nService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      Permissions[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException(this.i18n.t('errors.FORBIDDEN.PERMISSIONS'));
    }

    // Get permissions from user's roles
    const rolePermissions =
      user.roles?.flatMap(
        (role) =>
          role.permissions?.map((permission: Permission) => permission.name) || [],
      ) || [];

    return requiredPermissions.every((permission) =>
      rolePermissions.includes(permission),
    );
  }
}
