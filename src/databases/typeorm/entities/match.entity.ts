import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Club } from './club.entity';
import { League } from './league.entity';
import { Stadium } from './stadium.entity';
import { MatchScore } from './match-score.entity';

export enum MatchStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  HALF_TIME = 'half_time',
  FINISHED = 'finished',
  POSTPONED = 'postponed',
  CANCELLED = 'cancelled',
  ABANDONED = 'abandoned',
  EXTRA_TIME = 'extra_time',
  PENALTY_SHOOTOUT = 'penalty_shootout',
  AWARDED = 'awarded',
}

@Entity('matches')
export class Match extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Club)
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @Column()
  clubId: number;

  @ManyToOne(() => League)
  @JoinColumn({ name: 'clubLeagueId' })
  clubLeague: League;

  @Column()
  clubLeagueId: number;

  @ManyToOne(() => League)
  @JoinColumn({ name: 'clubSubLeagueId' })
  clubSubLeague: League;

  @Column()
  clubSubLeagueId: number;

  @Column({ nullable: true })
  clubMiniLeagueId: number | null;

  @ManyToOne(() => League, { nullable: true })
  @JoinColumn({ name: 'clubMiniLeagueId' })
  clubMiniLeague: League | null;

  @ManyToOne(() => Club)
  @JoinColumn({ name: 'opponentClubId' })
  opponentClub: Club;

  @Column()
  opponentClubId: number;

  @ManyToOne(() => League)
  @JoinColumn({ name: 'opponentLeagueId' })
  opponentLeague: League;

  @Column()
  opponentLeagueId: number;

  @ManyToOne(() => League)
  @JoinColumn({ name: 'opponentSubLeagueId' })
  opponentSubLeague: League;

  @Column()
  opponentSubLeagueId: number;

  @Column({ nullable: true })
  opponentMiniLeagueId: number | null;

  @ManyToOne(() => League, { nullable: true })
  @JoinColumn({ name: 'opponentMiniLeagueId' })
  opponentMiniLeague: League | null;

  @Column({
    type: 'timestamp with time zone',
  })
  matchDate: Date;

  @ManyToOne(() => Stadium)
  @JoinColumn({ name: 'stadiumId' })
  stadium: Stadium;

  @Column()
  stadiumId: number;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
  })
  status: MatchStatus;

  @OneToMany(() => MatchScore, (matchScore) => matchScore.match)
  matchScores: MatchScore[];

  @Column({
    type: 'integer',
    nullable: true,
  })
  clubScore: number | null;

  @Column({
    type: 'integer',
    nullable: true,
  })
  opponentClubScore: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  file: string | null;
}
