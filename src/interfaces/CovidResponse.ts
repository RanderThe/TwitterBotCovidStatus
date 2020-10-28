import { LocationStatistics } from "./LocationStatistics";
import { CovidStatistics } from "./CovidStatistics";

export interface CovidResponse {
  cities: any;
  max: CovidStatistics;
  total: LocationStatistics;
}
