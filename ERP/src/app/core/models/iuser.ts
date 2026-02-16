export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'employee';
  permissions: string[];
  avatar?: string;
}

export interface ILoginDTO {
  email: string;
  password?: string; 
}

export interface IAuthResponse {
  token: string;
  refreshToken: string;
  user: IUser;
}
