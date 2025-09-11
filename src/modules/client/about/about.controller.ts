import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AboutService } from './about.service';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('ℹ️ Client About')
@Controller('client/about')
@Public()
export class AboutController {
    constructor(private readonly aboutService: AboutService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    findAll() {
        return this.aboutService.findAll();
    }
}
