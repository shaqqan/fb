import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { Partner } from '../../../databases/typeorm/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Partner])],
  providers: [PartnerService],
  controllers: [PartnerController]
})
export class PartnerModule {}
