import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Club } from './club.entity';

@Entity('league')
export class League {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  title: any;

  @Column()
  logo: string;

  @OneToMany(() => Club, (club) => club.league)
  clubs: Club[];

  @ManyToOne(() => League)
  @JoinColumn({ name: 'parentLeagueId' })
  parentLeague: League;

  @OneToMany(() => League, (league) => league.parentLeague)
  childLeagues: League[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}