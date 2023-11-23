export const paginateSchema = {
  type: 'object',
  properties: {
    limit: { type: 'number' },
    offset: { type: 'number' },
  },
};

export const DateRangeSchema = {
  type: 'object',
  properties: {
    from_date: { type: 'string' },
    to_date: { type: 'string' },
  },
  required: ['from_date', 'to_date'],
};

export const titleQuerySchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
  },
  required: ['title'],
};

export const cronSchema = {
  type: 'object',
  properties: {
    hour: { type: 'string' },
  },
  required: ['hour'],
};
