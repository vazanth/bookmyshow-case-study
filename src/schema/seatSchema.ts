export const seatBodySchema = {
  type: 'object',
  properties: {
    show_time_id: { type: 'number' },
    row_letter: { type: 'string' },
    seat_number: { type: 'string' },
  },
  required: ['show_time_id', 'row_letter', 'seat_number'],
};

export const seatParamSchema = {
  type: 'object',
  properties: {
    show_time_id: { type: 'number' },
  },
  required: ['show_time_id'],
};
