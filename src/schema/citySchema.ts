export const cityBodySchema = {
  type: 'object',
  properties: {
    city_name: { type: 'string' },
  },
  required: ['city_name'],
};

export const cityParamSchema = {
  type: 'object',
  properties: {
    city_id: { type: 'number' },
  },
  required: ['city_id'],
};
