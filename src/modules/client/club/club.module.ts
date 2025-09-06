import { Module } from '@nestjs/common';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club, Match } from 'src/databases/typeorm/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Club, Match])],
  controllers: [ClubController],
  providers: [ClubService],
})
export class ClubModule { }
