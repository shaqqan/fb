import { Test, TestingModule } from '@nestjs/testing';
import { MatchScheduleService } from './match-schedule.service';

describe('MatchScheduleService', () => {
  let service: MatchScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchScheduleService],
    }).compile();

    service = module.get<MatchScheduleService>(MatchScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
