import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

import { AtGuard } from './common/guards';
import { MultilingualTransformInterceptor } from './common/interceptors';
import { appConfig, jwtConfig, typeormConfig, redisConfig, I18nConfig } from './common/configs';
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
    I18nModule.forRoot({
      fallbackLanguage: 'uz',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        new HeaderResolver(['x-lang']),
        new QueryResolver(['lang', 'locale', 'l']),
        new AcceptLanguageResolver(),
      ],
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
