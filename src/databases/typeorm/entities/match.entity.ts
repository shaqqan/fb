import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Club } from "./club.entity";
import { League } from "./league.entity";
import { Stadium } from "./stadium.entity";

export enum MatchStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('matches')
export class Match extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Club)
    @JoinColumn({ name: 'clubId' })
    club: Club;

    @Column()
    clubId: number;

    @Column()
    clubScore: number;

    @ManyToOne(() => League)
    @JoinColumn({ name: 'clubLeagueId' })
    clubLeague: League;

    @ManyToOne(() => League)
    @JoinColumn({ name: 'clubSubLeagueId' })
    clubSubLeague: League; 

    @Column()
    clubLeagueId: number;

    @ManyToOne(() => Club)
    @JoinColumn({ name: 'opponentClubId' })
    opponentClub: Club;

    @Column()
    opponentClubId: number;

    @Column()
    opponentClubScore: number;

    @ManyToOne(() => League)
    @JoinColumn({ name: 'opponentLeagueId' })
    opponentLeague: League;

    @Column()
    opponentLeagueId: number;

    @ManyToOne(() => League)
    @JoinColumn({ name: 'opponentSubLeagueId' })
    opponentSubLeague: League;

    @Column({
        type: 'timestamp with time zone',
    })
    matchDate: Date;

    @ManyToOne(() => Stadium)
    @JoinColumn({ name: 'stadiumId' })
    stadium: Stadium;

    @Column()
    stadiumId: number;

    @Column({
        type: 'enum',
        enum: MatchStatus,
        default: MatchStatus.PENDING,
    })
    status: MatchStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}