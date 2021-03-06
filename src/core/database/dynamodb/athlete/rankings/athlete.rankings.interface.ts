import { AgeCategory, Discipline, Gender, RankingType, Year } from 'shared/enums';
import { DDBTableKeyAttrs } from '../../interfaces/table.interface';

type KeyAttrs = DDBTableKeyAttrs;

interface Attrs {
  readonly name: string;
  readonly birthdate: string;
  readonly surname: string;
  readonly country: string;
  readonly normalizedName: string;
  readonly lastUpdatedAt?: number;
  readonly contestCount: number;
  readonly rankBeforeLatestContest: number;
  readonly latestUpdateWithContest: string;
}

interface NonKeyAttrs extends Attrs {}
export type AllAttrs = KeyAttrs & NonKeyAttrs;

export interface DDBAthleteRankingsItem extends Attrs {
  readonly athleteId: string;
  readonly rankingType: RankingType;
  readonly discipline: Discipline;
  readonly ageCategory: AgeCategory;
  readonly gender: Gender;
  readonly year: number;
  readonly points: number;
}

export interface DDBRankingsItemPrimaryKey {
  readonly rankingType: RankingType;
  readonly discipline: Discipline;
  readonly ageCategory: AgeCategory;
  readonly gender: Gender;
  readonly year: Year;
}

export interface DDBAthleteRankingsItemPrimaryKey extends DDBRankingsItemPrimaryKey {
  readonly athleteId: string;
}
