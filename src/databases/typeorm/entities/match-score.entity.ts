import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Match } from "./match.entity";

@Entity('match_scores')
export class MatchScore extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Match)
    @JoinColumn({ name: 'matchId' })
    match: Match;

    @Column()
    matchId: number;

    @Column()
    clubScore: number;

    @Column()
    opponentClubScore: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}