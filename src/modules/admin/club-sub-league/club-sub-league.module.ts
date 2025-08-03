import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubSubLeagueService } from './club-sub-league.service';
import { ClubSubLeagueController } from './club-sub-league.controller';
import { ClubSubLeague, Club, SubLeague } from '../../../databases/typeorm/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ClubSubLeague, Club, SubLeague])],
  controllers: [ClubSubLeagueController],
  providers: [ClubSubLeagueService],
})
export class ClubSubLeagueModule {}
