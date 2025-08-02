import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SubLeague } from './sub-league.entity';

@Entity('league')
export class League {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  title: any;

  @Column()
  logo: string;

  @OneToMany(() => SubLeague, (subLeague) => subLeague.league)
  subleagues: SubLeague[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}