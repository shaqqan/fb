import { Test, TestingModule } from '@nestjs/testing';
import { ClubSubLeagueController } from './club-sub-league.controller';
import { ClubSubLeagueService } from './club-sub-league.service';

describe('ClubSubLeagueController', () => {
  let controller: ClubSubLeagueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClubSubLeagueController],
      providers: [ClubSubLeagueService],
    }).compile();

    controller = module.get<ClubSubLeagueController>(ClubSubLeagueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
