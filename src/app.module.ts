import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule, I18nJsonLoader, I18nLoader } from 'nestjs-i18n';
import * as path from 'path';

import { AtGuard } from './common/guards';
import { MultilingualTransformInterceptor } from './common/interceptors';
import { appConfig, jwtConfig, typeormConfig, redisConfig, i18nConfig, I18nConfig } from './common/configs';
import { DatabasesModule } from './databases/databases.module';
import { ModulesModule } from './modules/modules.module';
import { TasksService } from './tasks.service';
import { News } from './databases/typeorm/entities';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, jwtConfig, typeormConfig, redisConfig, I18nConfig],
    }),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const i18nConfig = configService.get('i18n');
        return {
          fallbackLanguage: i18nConfig.fallbackLanguage,
          fallbacks: i18nConfig.fallbacks,
          typesOutputPath: i18nConfig.typesOutputPath,
          loaderOptions: {
            path: join(process.cwd(), i18nConfig.loaderOptions.path),
            watch: i18nConfig.loaderOptions.watch,
          },
        };
      },
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
