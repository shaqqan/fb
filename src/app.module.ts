import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule, I18nJsonLoader } from 'nestjs-i18n';
import * as path from 'path';

import { AtGuard } from './common/guards';
import { MultilingualTransformInterceptor } from './common/interceptors/multilingual-transform.interceptor';
import { appConfig, jwtConfig, typeormConfig, redisConfig } from './common/configs';
import { DatabasesModule } from './databases/databases.module';
import { ModulesModule } from './modules/modules.module';
import { TasksService } from './tasks.service';
import { News } from './databases/typeorm/entities';

const i18nPath = path.join(
  process.env.NODE_ENV === 'production' 
    ? path.join(process.cwd(), 'dist', 'i18n') 
    : path.join(__dirname, 'i18n'),
  ''
);

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, jwtConfig, typeormConfig, redisConfig],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: i18nPath,
        watch: process.env.NODE_ENV !== 'production',
      },
      loader: I18nJsonLoader,
    }),
    ScheduleModule.forRoot(),
    DatabasesModule,
    ModulesModule,
    TypeOrmModule.forFeature([News]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MultilingualTransformInterceptor,
    },
    TasksService,
  ],
})
export class AppModule { }
