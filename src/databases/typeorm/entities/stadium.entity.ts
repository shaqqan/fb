import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('stadiums')
export class Stadium extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'jsonb' })
    name: any;

    @Column()
    address: string;

    @Column()
    city: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}