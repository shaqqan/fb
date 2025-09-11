import { Module } from '@nestjs/common';
import { NewsModule } from './news/news.module';
import { ClubModule } from './club/club.module';
import { PartnerModule } from './partner/partner.module';
import { MatchModule } from './match/match.module';
import { PersonalModule } from './personal/personal.module';
import { AboutModule } from './about/about.module';
import { LeagueModule } from './league/league.module';

export const clientModules = [NewsModule, ClubModule, PartnerModule, MatchModule, PersonalModule, AboutModule, LeagueModule]
@Module({
  imports: clientModules
})
export class ClientModule { }
