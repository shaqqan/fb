import { Test, TestingModule } from '@nestjs/testing';
import { MatchScheduleController } from './match-schedule.controller';
import { MatchScheduleService } from './match-schedule.service';

describe('MatchScheduleController', () => {
  let controller: MatchScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchScheduleController],
      providers: [MatchScheduleService],
    }).compile();

    controller = module.get<MatchScheduleController>(MatchScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
