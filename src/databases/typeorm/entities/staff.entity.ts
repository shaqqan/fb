import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { StaffStatus } from './enums';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullname: string;

  @Column()
  position: string;

  @Column({ type: 'jsonb' })
  information: any;

  @Column()
  image: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: StaffStatus,
    default: StaffStatus.ACTIVE,
  })
  status: StaffStatus;

  @CreateDateColumn()
  createdAt: Date;
}