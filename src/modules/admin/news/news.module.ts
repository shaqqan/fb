import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { News, User } from '../../../databases/typeorm/entities';

@Module({
  imports: [TypeOrmModule.forFeature([News, User])],
  providers: [NewsService],
  controllers: [NewsController]
})
export class NewsModule {}
