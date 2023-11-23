export const movieBodySchema = {
  type: 'object',
  properties: {
    movie_name: { type: 'string' },
    language: { type: 'string' },
  },
  required: ['movie_name', 'language'],
};

export const movieParamSchema = {
  type: 'object',
  properties: {
    movie_id: { type: 'number' },
  },
  required: ['movie_id'],
};
