export interface IAuthModel {

}

export interface ILoginCredentials {
  userNameOrEmailAddress: string;
  password: string;
  rememberMe: boolean;
}

export interface ILoginResponse {
    result: number; // 1 = Success, 2 = InvalidCredentials , etc
    description?: string;
}

export interface ICurrentUser {
  isAuthenticated: boolean;
  id?: string;
  userName?: string;
  email?: string;
  roles?: string[];
  tenantId?: string;
}


