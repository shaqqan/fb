import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule, I18nJsonLoader, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';

import { AtGuard } from './common/guards';
import { MultilingualTransformInterceptor } from './common/interceptors/multilingual-transform.interceptor';
import { appConfig, jwtConfig, typeormConfig, redisConfig, I18nConfig } from './common/configs';
import { DatabasesModule } from './databases/databases.module';
import { ModulesModule } from './modules/modules.module';
import { TasksService } from './tasks.service';
import { News } from './databases/typeorm/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, jwtConfig, typeormConfig, redisConfig, I18nConfig],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage:
          configService.getOrThrow<ConfigType<typeof I18nConfig>>('i18n')
            .fakerLocale,
        loaderOptions: {
          path: path.join(process.cwd(), 'src/i18n/'),
          watch: process.env.NODE_ENV !== 'production',
        },
      }),
      resolvers: [new HeaderResolver(['x-lang'])],
      inject: [ConfigService],
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
