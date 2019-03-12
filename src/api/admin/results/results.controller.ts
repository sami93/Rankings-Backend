import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ContestResultsDto, contestResultsDtoSchema } from 'api/webapp/contest/dto/results.dto';
import { AthleteService } from 'core/athlete/athlete.service';
import { ContestService } from 'core/contest/contest.service';
import { DatabaseService } from 'core/database/database.service';
import { AthleteContestRecordService } from 'dynamodb-streams/athlete/athlete-contest-record.service';
import { Discipline } from 'shared/enums';
import { logger } from 'shared/logger';
import { JoiValidationPipe } from 'shared/pipes/JoiValidation.pipe';
import { Utils } from 'shared/utils';
import { IResultsResponseItem, ResultsResponse } from './dto/results.response';

@Controller('results')
export class ResultsController {
  constructor(
    private readonly athleteService: AthleteService,
    private readonly contestService: ContestService,
    private readonly athleteRecordsService: AthleteContestRecordService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get(':id/:discipline')
  public async getResults(
    @Param('id') id: string,
    @Param('discipline', new ParseIntPipe())
    discipline: Discipline,
  ): Promise<ResultsResponse> {
    const results = await this.contestService.getResults(id, discipline, undefined);
    const athletesWithPlaces = await Promise.all(
      results.items.map(async item => {
        const athlete = await this.athleteService.getAthlete(item.athleteId);
        return { athlete, item };
      }),
    );
    return new ResultsResponse(
      athletesWithPlaces.map<IResultsResponseItem>(obj => ({
        id: obj.athlete.id,
        name: obj.athlete.name,
        place: obj.item.place,
        points: obj.item.points,
        surname: obj.athlete.surname,
      })),
    );
  }
  @Post('fixrankings/:id')
  public async fixAthleteRankings(@Param('id') id: string): Promise<string> {
    // const allAthletes = await this.databaseService.queryAthletes(undefined);
    const athlete = await this.databaseService.getAthleteDetails(id);
    if (!athlete) {
      return 'Athlete Not Found';
    }
    // for (const athlete of allAthletes.items) {
    logger.info('Fix Athlete Rankings', id);

    await this.databaseService.deleteAthleteRankings(athlete.id);
    const contestResults = await this.databaseService.queryAthleteContestsByDate(athlete.id, undefined);
    for (const contestResult of contestResults.items) {
      const year = Utils.dateToMoment(contestResult.contestDate).year();
      await this.athleteRecordsService.updateRankingsForCombinations(
        athlete.id,
        contestResult.contestDiscipline,
        year,
        contestResult.points,
      );
    }
    // }
  }
}
