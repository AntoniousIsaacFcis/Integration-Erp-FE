import { IUser } from "@core/models/iuser";

export const MOCK_ADMIN_USER: IUser = {
  id: '1',
  name: 'أحمد علي',
  role: 'admin',
  email:'admin@erp.com',
  permissions: ['manage_employees']
};

export const AUTH_TOKEN = 'fake-jwt-token';
