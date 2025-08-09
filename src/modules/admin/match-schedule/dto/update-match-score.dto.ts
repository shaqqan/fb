import { PartialType } from '@nestjs/swagger';
import { CreateMatchScoreDto } from './create-match-score.dto';

export class UpdateMatchScoreDto extends PartialType(CreateMatchScoreDto) {}
