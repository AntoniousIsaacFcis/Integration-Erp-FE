export interface IAuthModel {

}

export interface ICurrentUser {
  isAuthenticated: boolean;
  id?: string;
  userName?: string;
  email?: string;
  roles?: string[];
  tenantId?: string;
}

export interface ILoginResponse {
  result: {
    result: number; // 1 = Success, 2 = InvalidCredentials , etc
    description?: string;
  };
}
