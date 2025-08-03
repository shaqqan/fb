import { Test, TestingModule } from '@nestjs/testing';
import { ClubSubLeagueService } from './club-sub-league.service';

describe('ClubSubLeagueService', () => {
  let service: ClubSubLeagueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClubSubLeagueService],
    }).compile();

    service = module.get<ClubSubLeagueService>(ClubSubLeagueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
