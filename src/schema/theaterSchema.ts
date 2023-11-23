export const getTheatersSchema = {
  type: 'object',
  properties: {
    city_id: { type: 'string' },
    limit: { type: 'number' },
    offset: { type: 'number' },
  },
  required: ['city_id'],
};

export const theaterParamSchema = {
  type: 'object',
  properties: {
    theater_id: { type: 'number' },
  },
  required: ['theater_id'],
};

export const theaterBodySchema = {
  type: 'object',
  properties: {
    theater_name: { type: 'string' },
    city_id: { type: 'number' },
    no_of_screens: { type: 'number' },
  },
  required: ['theater_name', 'city_id', 'no_of_screens'],
};
