import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { StaffModule } from './staff/staff.module';
import { PartnerModule } from './partner/partner.module';
import { LeaguesModule } from './leagues/leagues.module';
import { UploadModule } from './upload/upload.module';
import { ClubModule } from './club/club.module';
import { MatchScheduleModule } from './match-schedule/match-schedule.module';
import { StadiumModule } from './stadium/stadium.module';
import { PersonalModule } from './personal/personal.module';

@Module({
  imports: [
    AuthModule,
    NewsModule,
    StaffModule,
    PartnerModule,
    LeaguesModule,
    UploadModule,
    ClubModule,
    MatchScheduleModule,
    StadiumModule,
    PersonalModule,
  ]
})
export class AdminModule {}
