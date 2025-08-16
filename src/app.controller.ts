import { Controller, Get, Req } from '@nestjs/common';
import { I18n, I18nService } from 'nestjs-i18n';

@Controller()
export class AppController {
  constructor(private readonly i18n: I18nService) {}

  @Get()
  getHello(@I18n() i18n: I18nService): string {
    return i18n.t('translation.welcome');
  }

  @Get('/greeting')
  getGreeting(@I18n() i18n: I18nService): string {
    return i18n.t('translation.greeting', { args: { name: 'John' } });
  }
}
