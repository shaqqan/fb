import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClubSubLeague } from './club-sub-league.entity';
import { League } from './league.entity';

@Entity('club')
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  name: any;

  @Column()
  logo: string;

  @ManyToOne(() => League, (league) => league.clubs)
  @JoinColumn({ name: 'leagueId' })
  league: League;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}