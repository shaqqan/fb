import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { PartnerStatus } from './enums';

@Entity('partner')
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  name: any;

  @Column({ type: 'jsonb' })
  description: any;

  @Column()
  image: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: PartnerStatus,
    default: PartnerStatus.ACTIVE,
  })
  status: PartnerStatus;

  @CreateDateColumn()
  createdAt: Date;
}
