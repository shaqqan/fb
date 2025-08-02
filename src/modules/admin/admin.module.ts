import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { StaffModule } from './staff/staff.module';
import { PartnerModule } from './partner/partner.module';
import { LeaguesModule } from './leagues/leagues.module';

@Module({
  imports: [
    AuthModule,
    NewsModule,
    StaffModule,
    PartnerModule,
    LeaguesModule,
  ]
})
export class AdminModule {}
