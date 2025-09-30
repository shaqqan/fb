import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('personals')
export class Personal extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'jsonb'
    })
    fullName: any

    @Column({ type: 'jsonb' })
    position: any

    @Column({ type: 'jsonb' })
    information: any

    @Column({ nullable: true })
    phone: string

    @Column({ nullable: true })
    email: string

    @Column()
    avatar: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}