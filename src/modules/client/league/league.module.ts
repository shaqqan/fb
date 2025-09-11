import { Module } from '@nestjs/common';
import { LeagueService } from './league.service';
import { LeagueController } from './league.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { League } from 'src/databases/typeorm/entities';

@Module({
  imports: [TypeOrmModule.forFeature([League])],
  controllers: [LeagueController],
  providers: [LeagueService],
})
export class LeagueModule { }
