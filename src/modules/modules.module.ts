import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [AdminModule, ClientModule]
})
export class ModulesModule {}
