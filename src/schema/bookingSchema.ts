export const bookingBodySchema = {
  type: 'object',
  properties: {
    show_time_id: { type: 'number' },
    no_of_tickets: { type: 'number' },
    seat_no: { type: 'string' },
  },
  required: ['show_time_id', 'no_of_tickets', 'seat_no'],
};
