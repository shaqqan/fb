import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { League } from './league.entity';
import { ClubSubLeague } from './club-sub-league.entity';

@Entity('subleagues')
export class SubLeague {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  title: any;

  @Column()
  logo: string;

  @Column()
  leagueId: number;

  @ManyToOne(() => League, (league) => league.subleagues)
  @JoinColumn({ name: 'leagueId' })
  league: League;

  @OneToMany(() => ClubSubLeague, (clubSubLeague) => clubSubLeague.subLeague)
  clubLinks: ClubSubLeague[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}