import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ClubSubLeague } from './club-sub-league.entity';

@Entity('club')
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  name: any;

  @Column()
  logo: string;

  @OneToMany(() => ClubSubLeague, (clubSubLeague) => clubSubLeague.club)
  subLinks: ClubSubLeague[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}