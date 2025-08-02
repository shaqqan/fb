import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CreatePartnerDto, UpdatePartnerDto } from './dto';
import { Partner } from '../../../databases/typeorm/entities';
import { Public } from 'src/common/decorators';
import { PartnerService } from './partner.service';

@Controller('partner')
export class PartnerController {
    constructor(
        private readonly partnerService: PartnerService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreatePartnerDto): Promise<Partner> {
        return this.partnerService.create(dto);
    }

    @Public()
    @Get()
    @HttpCode(HttpStatus.OK)
    getAll(): Promise<Partner[]> {
        return this.partnerService.getAll();
    }

    @Public()
    @Get("/:id")
    @HttpCode(HttpStatus.OK)
    getById(@Param("id") id: string): Promise<Partner> {
        return this.partnerService.getById(+id);
    }

    @Patch("/:id")
    @HttpCode(HttpStatus.OK)
    update(@Param("id") id: string, @Body() dto: UpdatePartnerDto): Promise<Partner> {
        return this.partnerService.update({ id: +id, data: dto });
    }

    @Delete("/:id")
    @HttpCode(HttpStatus.OK)
    delete(@Param("id") id: string): Promise<Partner> {
        return this.partnerService.remove(+id);
    }
}
