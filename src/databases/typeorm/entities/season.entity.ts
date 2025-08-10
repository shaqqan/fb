import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('seasons')
export class Season extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'jsonb',
    })
    name: object;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}