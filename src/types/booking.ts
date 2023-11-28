export type BookingRequestBody = {
  show_time_id: number;
  no_of_tickets: number;
  seat_no: string;
};

export type PaymentRequestBody = {
  payment_method_types: string[];
  booking_id: number;
  amount: number;
  currency: string;
};
