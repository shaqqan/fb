import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateLeagueDto, UpdateLeagueDto, SimplifiedLeagueDto } from './dto';
import { League } from '../../../databases/typeorm/entities';

@Injectable()
export class LeaguesService {
    constructor(
        @InjectRepository(League)
        private leagueRepository: Repository<League>
    ) { }

    async create(data: CreateLeagueDto): Promise<League> {
        // Validate parent league exists if provided
        if (data.parentLeagueId) {
            const parentLeague = await this.leagueRepository.findOne({
                where: { id: data.parentLeagueId }
            });
            if (!parentLeague) {
                throw new NotFoundException(`Parent league with ID ${data.parentLeagueId} not found`);
            }
        }

        return await this.leagueRepository.save({
            ...data,
            parentLeagueId: data.parentLeagueId,
            title: data.title as any
        });
    }

    async getAll(query: PaginateQuery): Promise<Paginated<League>> {
        const queryBuilder = this.leagueRepository
            .createQueryBuilder('league')
            .leftJoinAndSelect('league.parentLeague', 'parentLeague')
            .leftJoinAndSelect('league.childLeagues', 'childLeagues')
            .leftJoinAndSelect('league.clubs', 'clubs');

        return paginate(query, queryBuilder, {
            sortableColumns: ['id', 'createdAt', 'updatedAt'],
            nullSort: 'last',
            defaultSortBy: [['createdAt', 'DESC']],
            searchableColumns: ['title'],
            filterableColumns: {
                parentLeagueId: true,
            },
            defaultLimit: 10,
            maxLimit: 100,
        });
    }

    async getById(id: number): Promise<League> {
        const league = await this.leagueRepository.findOne({
            where: { id },
            relations: ['parentLeague', 'childLeagues', 'clubs']
        });

        if (!league) {
            throw new NotFoundException(`League with ID ${id} not found`);
        }

        return league;
    }

    async getChildren(id: number): Promise<League[]> {
        const league = await this.leagueRepository.findOne({
            where: { id },
            relations: ['childLeagues', 'childLeagues.childLeagues']
        });

        if (!league) {
            throw new NotFoundException(`League with ID ${id} not found`);
        }

        return league.childLeagues || [];
    }

    async getParent(id: number): Promise<League | null> {
        const league = await this.leagueRepository.findOne({
            where: { id },
            relations: ['parentLeague', 'parentLeague.parentLeague']
        });

        if (!league) {
            throw new NotFoundException(`League with ID ${id} not found`);
        }

        return league.parentLeague || null;
    }

async getRootLeagues(query: PaginateQuery): Promise<Paginated<League>> {
        const queryBuilder = this.leagueRepository
            .createQueryBuilder('league')
            .leftJoinAndSelect('league.childLeagues', 'childLeagues')
            .leftJoinAndSelect('league.clubs', 'clubs')
            .where('league.parentLeague IS NULL');

        return paginate(query, queryBuilder, {
            sortableColumns: ['id', 'createdAt', 'updatedAt'],
            nullSort: 'last',
            defaultSortBy: [['createdAt', 'DESC']],
            searchableColumns: ['title'],
            defaultLimit: 10,
            maxLimit: 100,
        });
    }

    async getHierarchy(id: number): Promise<League> {
        const league = await this.leagueRepository.findOne({
            where: { id },
            relations: [
                'parentLeague',
                'parentLeague.parentLeague',
                'parentLeague.parentLeague.parentLeague',
                'childLeagues',
                'childLeagues.childLeagues',
                'childLeagues.childLeagues.childLeagues',
                'clubs'
            ]
        });

        if (!league) {
            throw new NotFoundException(`League with ID ${id} not found`);
        }

        return league;
    }

    async getSubLeagues(query: PaginateQuery): Promise<Paginated<League>> {
        const queryBuilder = this.leagueRepository
            .createQueryBuilder('league')
            .leftJoinAndSelect('league.parentLeague', 'parentLeague')
            .leftJoinAndSelect('league.childLeagues', 'childLeagues')
            .leftJoinAndSelect('league.clubs', 'clubs')
            .where('league.parentLeague IS NOT NULL');

        return paginate(query, queryBuilder, {
            sortableColumns: ['id', 'createdAt', 'updatedAt', 'title'],
            nullSort: 'last',
            defaultSortBy: [['createdAt', 'DESC']],
            searchableColumns: ['title'],
            defaultLimit: 10,
            maxLimit: 100,
        });
    }

    async getSimpleLeagues(): Promise<SimplifiedLeagueDto[]> {
        return await this.leagueRepository
            .createQueryBuilder('league')
            .select(['league.id', 'league.title'])
            .getMany();
    }

    async getSimpleSubLeagues(): Promise<SimplifiedLeagueDto[]> {
        return await this.leagueRepository
            .createQueryBuilder('league')
            .select(['league.id', 'league.title'])
            .where('league.parentLeague IS NOT NULL')
            .getMany();
    }

    private async wouldCreateCircularReference(leagueId: number, parentLeagueId: number): Promise<boolean> {
        if (leagueId === parentLeagueId) {
            return true;
        }

        // Check if the parent league is a descendant of the current league
        const descendants = await this.getAllDescendants(leagueId);
        return descendants.some(descendant => descendant.id === parentLeagueId);
    }

    private async getAllDescendants(id: number): Promise<League[]> {
        const descendants: League[] = [];
        const children = await this.getChildren(id);

        for (const child of children) {
            descendants.push(child);
            const childDescendants = await this.getAllDescendants(child.id);
            descendants.push(...childDescendants);
        }

        return descendants;
    }

    async update({ id, data }: { id: number, data: UpdateLeagueDto }): Promise<League> {
        // Check if league exists
        const existingLeague = await this.leagueRepository.findOne({
            where: { id }
        });

        if (!existingLeague) {
            throw new NotFoundException(`League with ID ${id} not found`);
        }

        // Validate parent league if provided
        if (data.parentLeagueId !== undefined) {
            if (data.parentLeagueId === null) {
                // Allow setting parent to null (making it a root league)
            } else {
                const parentLeague = await this.leagueRepository.findOne({
                    where: { id: data.parentLeagueId }
                });
                if (!parentLeague) {
                    throw new NotFoundException(`Parent league with ID ${data.parentLeagueId} not found`);
                }

                // Check for circular reference
                if (await this.wouldCreateCircularReference(id, data.parentLeagueId)) {
                    throw new BadRequestException(
                        `Cannot set league ${data.parentLeagueId} as parent: would create a circular reference`
                    );
                }
            }
        }

        const updateData: any = { ...data };
        if (data.title) updateData.title = data.title;
        if (data.logo) updateData.logo = data.logo;
        if (data.parentLeagueId !== undefined) {
            updateData.parentLeague = data.parentLeagueId ? { id: data.parentLeagueId } : null;
        }

        await this.leagueRepository.update(id, updateData);

        return await this.getById(id);
    }

    async remove(id: number): Promise<{ message: string }> {
        const league = await this.leagueRepository.findOne({
            where: { id },
            relations: ['childLeagues', 'clubs']
        });

        if (!league) {
            throw new NotFoundException(`League with ID ${id} not found`);
        }

        // Check if league has children
        if (league.childLeagues && league.childLeagues.length > 0) {
            throw new BadRequestException(
                `Cannot delete league: it has ${league.childLeagues.length} child league(s). ` +
                `Remove or reassign child leagues first.`
            );
        }

        // Check if league has clubs
        if (league.clubs && league.clubs.length > 0) {
            throw new BadRequestException(
                `Cannot delete league: it has ${league.clubs.length} club(s). ` +
                `Remove or reassign clubs first.`
            );
        }

        await this.leagueRepository.delete(id);
        return { message: 'League deleted successfully' };
    }
}
