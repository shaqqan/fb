import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NewsStatus } from './enums';
import { User } from './user.entity';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  title: any;

  @Column({ type: 'jsonb' })
  description: any;

  @Column('text', { array: true })
  images: string[];

  @Column({
    type: 'enum',
    enum: NewsStatus,
    default: NewsStatus.DRAFT,
  })
  status: NewsStatus;

  @Column()
  authorId: number;

  @ManyToOne(() => User, (user) => user.news)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}