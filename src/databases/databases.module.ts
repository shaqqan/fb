import { Module } from '@nestjs/common';
import { TypeormModule } from './typeorm/typeorm.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [TypeormModule, RedisModule]
})
export class DatabasesModule {}
