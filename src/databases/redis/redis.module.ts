import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { Global } from '@nestjs/common';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule { }
