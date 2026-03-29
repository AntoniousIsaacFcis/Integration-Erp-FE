export interface IUser {
  id: string;
  userName: string;
  email: string;
  role: string[];
  isAuthenticated: boolean
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
