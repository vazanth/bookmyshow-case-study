export type SeatParams = {
  show_time_id: string;
};

export type SeatBody = {
  show_time_id: number;
  row_letter: string;
  seat_number: string;
};

export type BookedSeats = {
  actual_seat_no: string;
};

export type FetchSeatMaster = BookedSeats & {
  show_time_id: number;
};
