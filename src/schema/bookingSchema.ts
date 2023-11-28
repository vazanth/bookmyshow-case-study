export const bookingBodySchema = {
  type: 'object',
  properties: {
    show_time_id: { type: 'number' },
    no_of_tickets: { type: 'number' },
    seat_no: { type: 'string' },
  },
  required: ['show_time_id', 'no_of_tickets', 'seat_no'],
};

export const paymentBodySchema = {
  type: 'object',
  properties: {
    payment_method_types: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    booking_id: { type: 'number' },
    amount: { type: 'string' },
    currency: { type: 'string' },
  },
  required: ['payment_method_types', 'booking_id', 'amount', 'currency'],
};
