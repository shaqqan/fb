import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { Staff } from '../../../databases/typeorm/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  providers: [StaffService],
  controllers: [StaffController]
})
export class StaffModule {}
