import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { PartnerModule } from './partner/partner.module';
import { LeaguesModule } from './leagues/leagues.module';
import { UploadModule } from './upload/upload.module';
import { ClubModule } from './club/club.module';
import { MatchScheduleModule } from './match-schedule/match-schedule.module';
import { StadiumModule } from './stadium/stadium.module';
import { PersonalModule } from './personal/personal.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    NewsModule,
    PartnerModule,
    LeaguesModule,
    UploadModule,
    ClubModule,
    MatchScheduleModule,
    StadiumModule,
    PersonalModule,
    RoleModule,
    PermissionModule,
    UserModule,
  ]
})
export class AdminModule {}
