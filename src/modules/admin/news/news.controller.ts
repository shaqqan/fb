import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateNewsDto, UpdateNewsDto } from './dto';
import { News, NewsStatus, User } from '../../../databases/typeorm/entities';
import { NewsService } from './news.service';
import { GetCurrentUser, GetCurrentUserId, Public } from 'src/common/decorators';

@Controller('news')
export class NewsController {
    constructor(
        private readonly newsService: NewsService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@GetCurrentUserId() userId: number, @Body() dto: CreateNewsDto): Promise<News> {
        return this.newsService.create({
            data: dto,
            authorId: userId,
        });
    }

    @Public()
    @Get()
    @HttpCode(HttpStatus.OK)
    getAll(@Param("status") status: NewsStatus, @GetCurrentUser() user: User): Promise<News[]> {
        return this.newsService.getAll(status, user);
    }


    @Public()
    @Get("/latest")
    @HttpCode(HttpStatus.OK)
    getLatest(): Promise<News[]> {
        return this.newsService.getLatest();
    }

    @Public()
    @Get("/:id")
    @HttpCode(HttpStatus.OK)
    getById(@Param("id") id: string): Promise<News> {
        return this.newsService.getById(+id);
    }

    @Patch("/:id")
    @HttpCode(HttpStatus.OK)
    update(@Param("id") id: string, @Body() dto: UpdateNewsDto): Promise<News> {
        return this.newsService.update({ id: +id, data: dto });
    }

    @Delete("/:id")
    @HttpCode(HttpStatus.OK)
    delete(@Param("id") id: string): Promise<News> {
        return this.newsService.remove(+id);
    }
}
