import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { StaffModule } from './staff/staff.module';
import { PartnerModule } from './partner/partner.module';
import { LeaguesModule } from './leagues/leagues.module';
import { UploadModule } from './upload/upload.module';
import { ClubSubLeagueModule } from './club-sub-league/club-sub-league.module';

@Module({
  imports: [
    AuthModule,
    NewsModule,
    StaffModule,
    PartnerModule,
    LeaguesModule,
    UploadModule,
    ClubSubLeagueModule,
  ]
})
export class AdminModule {}
