import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { Staff } from '../../../databases/typeorm/entities';
import { Public } from 'src/common/decorators';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
    constructor(
        private readonly staffService: StaffService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateStaffDto): Promise<Staff> {
        return this.staffService.create(dto);
    }

    @Public()
    @Get()
    @HttpCode(HttpStatus.OK)
    getAll(): Promise<Staff[]> {
        return this.staffService.getAll();
    }

    @Public()
    @Get("/:id")
    @HttpCode(HttpStatus.OK)
    getById(@Param("id") id: string): Promise<Staff> {
        return this.staffService.getById(+id);
    }

    @Patch("/:id")
    @HttpCode(HttpStatus.OK)
    update(@Param("id") id: string, @Body() dto: UpdateStaffDto): Promise<Staff> {
        return this.staffService.update({ id: +id, data: dto });
    }

    @Delete("/:id")
    @HttpCode(HttpStatus.OK)
    delete(@Param("id") id: string): Promise<Staff> {
        return this.staffService.remove(+id);
    }
}
