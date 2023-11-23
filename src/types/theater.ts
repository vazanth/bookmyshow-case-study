import { PaginationParam } from './common';

export type CityQueryParam = {
  city_id: string;
} & PaginationParam;

export type TheaterIdParam = {
  theater_id: string;
};

export type TheaterReqBody = {
  theater_name: string;
  city_id: number;
  no_of_screens: number;
};
