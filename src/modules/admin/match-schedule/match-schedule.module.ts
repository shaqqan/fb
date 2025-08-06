import { Module } from '@nestjs/common';
import { MatchScheduleService } from './match-schedule.service';
import { MatchScheduleController } from './match-schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/databases/typeorm/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Match])],
  controllers: [MatchScheduleController],
  providers: [MatchScheduleService],
  exports: [MatchScheduleService],
})
export class MatchScheduleModule { }
