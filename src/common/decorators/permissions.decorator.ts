import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../constants';
import { Permissions } from '../enums/permission.enum';

export const RequirePermissions = (...permissions: Permissions[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
