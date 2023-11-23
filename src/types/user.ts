export type UserRequestBody = {
  name: string;
  email: string;
  mobile: number;
  password: string;
  city_id: number;
  role: 'admin' | 'customer';
};
