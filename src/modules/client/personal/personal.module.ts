import { Module } from '@nestjs/common';
import { PersonalService } from './personal.service';
import { PersonalController } from './personal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personal } from 'src/databases/typeorm/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Personal])],
  controllers: [PersonalController],
  providers: [PersonalService],
})
export class PersonalModule {}
