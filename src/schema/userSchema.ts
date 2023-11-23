export const signUpSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    mobile: { type: 'number' },
    city_id: { type: 'number' },
    role: { type: 'string', enum: ['admin', 'customer'] },
  },
  required: ['name', 'email', 'password', 'mobile', 'city_id', 'role'],
};

export const signInSchema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    password: { type: 'string' },
  },
  required: ['email', 'password'],
};
