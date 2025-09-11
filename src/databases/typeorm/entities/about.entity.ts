import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('about')
export class About extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'jsonb' })
    title: any;

    @Column({ type: 'jsonb' })
    description: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}