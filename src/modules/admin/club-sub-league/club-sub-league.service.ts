import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateClubSubLeagueDto, UpdateClubSubLeagueDto } from './dto';
import { ClubSubLeague, Club, SubLeague } from '../../../databases/typeorm/entities';

@Injectable()
export class ClubSubLeagueService {
    constructor(
        @InjectRepository(ClubSubLeague)
        private clubSubLeagueRepository: Repository<ClubSubLeague>,
        @InjectRepository(Club)
        private clubRepository: Repository<Club>,
        @InjectRepository(SubLeague)
        private subLeagueRepository: Repository<SubLeague>
    ) { }

    async create(data: CreateClubSubLeagueDto): Promise<ClubSubLeague> {
        // Check if club exists
        const club = await this.clubRepository.findOne({
            where: { id: data.clubId }
        });
        if (!club) {
            throw new NotFoundException(`Club with ID ${data.clubId} not found`);
        }

        // Check if sub-league exists
        const subLeague = await this.subLeagueRepository.findOne({
            where: { id: data.subLeagueId }
        });
        if (!subLeague) {
            throw new NotFoundException(`SubLeague with ID ${data.subLeagueId} not found`);
        }

        // Check if relationship already exists
        const existingRelation = await this.clubSubLeagueRepository.findOne({
            where: {
                clubId: data.clubId,
                subLeagueId: data.subLeagueId
            }
        });
        if (existingRelation) {
            throw new ConflictException(`Club ${data.clubId} is already linked to SubLeague ${data.subLeagueId}`);
        }

        return await this.clubSubLeagueRepository.save(data);
    }

    async findAll(query: PaginateQuery): Promise<Paginated<ClubSubLeague>> {
        const queryBuilder = this.clubSubLeagueRepository
            .createQueryBuilder('clubSubLeague')
            .leftJoinAndSelect('clubSubLeague.club', 'club')
            .leftJoinAndSelect('clubSubLeague.subLeague', 'subLeague');

        return paginate(query, queryBuilder, {
            sortableColumns: ['clubId', 'subLeagueId'],
            nullSort: 'last',
            defaultSortBy: [['clubId', 'ASC']],
            filterableColumns: {
                clubId: true,
                subLeagueId: true,
            },
            defaultLimit: 10,
            maxLimit: 100,
        });
    }

    async findOne(clubId: number, subLeagueId: number): Promise<ClubSubLeague> {
        const clubSubLeague = await this.clubSubLeagueRepository.findOne({
            where: { clubId, subLeagueId },
            relations: ['club', 'subLeague']
        });

        if (!clubSubLeague) {
            throw new NotFoundException(`Club-SubLeague relationship with Club ID ${clubId} and SubLeague ID ${subLeagueId} not found`);
        }

        return clubSubLeague;
    }

    async findByClub(clubId: number): Promise<ClubSubLeague[]> {
        const club = await this.clubRepository.findOne({
            where: { id: clubId }
        });
        if (!club) {
            throw new NotFoundException(`Club with ID ${clubId} not found`);
        }

        return await this.clubSubLeagueRepository.find({
            where: { clubId },
            relations: ['club', 'subLeague']
        });
    }

    async findBySubLeague(subLeagueId: number): Promise<ClubSubLeague[]> {
        const subLeague = await this.subLeagueRepository.findOne({
            where: { id: subLeagueId }
        });
        if (!subLeague) {
            throw new NotFoundException(`SubLeague with ID ${subLeagueId} not found`);
        }

        return await this.clubSubLeagueRepository.find({
            where: { subLeagueId },
            relations: ['club', 'subLeague']
        });
    }

    async update(clubId: number, subLeagueId: number, data: UpdateClubSubLeagueDto): Promise<ClubSubLeague> {
        // For a junction table, update typically means changing the relationship
        // We'll first check if the current relationship exists
        const existingRelation = await this.clubSubLeagueRepository.findOne({
            where: { clubId, subLeagueId }
        });

        if (!existingRelation) {
            throw new NotFoundException(`Club-SubLeague relationship with Club ID ${clubId} and SubLeague ID ${subLeagueId} not found`);
        }

        // If new IDs are provided, we need to check they don't create a duplicate
        if (data.clubId || data.subLeagueId) {
            const newClubId = data.clubId || clubId;
            const newSubLeagueId = data.subLeagueId || subLeagueId;

            if (newClubId !== clubId || newSubLeagueId !== subLeagueId) {
                const duplicateCheck = await this.clubSubLeagueRepository.findOne({
                    where: { clubId: newClubId, subLeagueId: newSubLeagueId }
                });

                if (duplicateCheck) {
                    throw new ConflictException(`Club ${newClubId} is already linked to SubLeague ${newSubLeagueId}`);
                }

                // Remove old relationship and create new one
                await this.clubSubLeagueRepository.delete({ clubId, subLeagueId });
                return await this.clubSubLeagueRepository.save({
                    clubId: newClubId,
                    subLeagueId: newSubLeagueId
                });
            }
        }

        return existingRelation;
    }

    async remove(clubId: number, subLeagueId: number): Promise<{ message: string }> {
        const clubSubLeague = await this.clubSubLeagueRepository.findOne({
            where: { clubId, subLeagueId }
        });

        if (!clubSubLeague) {
            throw new NotFoundException(`Club-SubLeague relationship with Club ID ${clubId} and SubLeague ID ${subLeagueId} not found`);
        }

        await this.clubSubLeagueRepository.delete({ clubId, subLeagueId });
        return { message: `Club ${clubId} successfully unlinked from SubLeague ${subLeagueId}` };
    }
}
