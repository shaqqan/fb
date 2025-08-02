import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { Club } from './club.entity';
import { SubLeague } from './sub-league.entity';

@Entity('club_subleague')
export class ClubSubLeague {
  @PrimaryColumn()
  clubId: number;

  @PrimaryColumn()
  subLeagueId: number;

  @ManyToOne(() => Club, (club) => club.subLinks)
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @ManyToOne(() => SubLeague, (subLeague) => subLeague.clubLinks)
  @JoinColumn({ name: 'subLeagueId' })
  subLeague: SubLeague;
}