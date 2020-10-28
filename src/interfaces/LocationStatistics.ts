import { CovidStatistics } from "./CovidStatistics";

export interface LocationStatistics extends CovidStatistics {
  city: String;
  city_ibge_code: Number;
  city_str: String;
  date: Date;
  date_str: String;
  estimated_population: Number;
  state: String;
}
