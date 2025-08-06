import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { League } from './league.entity';

@Entity('club')
export class Club extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  name: any;

  @Column()
  logo: string;

  @ManyToOne(() => League, (league) => league.clubs)
  @JoinColumn({ name: 'leagueId' })
  league: League;

  @ManyToOne(() => League, (subLeague) => subLeague.clubs)
  @JoinColumn({ name: 'subLeagueId' })
  subLeague: League;

  @Column({ type: 'jsonb' })
  information: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}