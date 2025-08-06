import { PartialType } from '@nestjs/swagger';
import { CreateMatchScheduleDto } from './create-match-schedule.dto';

export class UpdateMatchScheduleDto extends PartialType(CreateMatchScheduleDto) {}
