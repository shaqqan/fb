import { Module } from '@nestjs/common';
import { StadiumService } from './stadium.service';
import { StadiumController } from './stadium.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stadium } from 'src/databases/typeorm/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Stadium])],
  controllers: [StadiumController],
  providers: [StadiumService],
  exports: [StadiumService],
})
export class StadiumModule {}
