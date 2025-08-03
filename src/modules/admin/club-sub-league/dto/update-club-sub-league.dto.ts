import { PartialType } from '@nestjs/mapped-types';
import { CreateClubSubLeagueDto } from './create-club-sub-league.dto';

export class UpdateClubSubLeagueDto extends PartialType(CreateClubSubLeagueDto) {}
