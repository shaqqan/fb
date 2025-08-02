import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from './enums';
import { News } from './news.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MODER,
  })
  role: Role;

  @Column()
  hash: string;

  @Column({ type: 'varchar', nullable: true })
  hashedRt: string | null;

  @OneToMany(() => News, (news) => news.author)
  news: News[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}