export interface ISendPasswordResetCode {
  email: string;
  appName?: string;
  returnUrl?: string;
  returnUrlHash?: string;
}

export interface IVerifyPasswordResetToken {
  userId: string;
  resetToken: string;
}

export interface IResetPassword {
  userId: string;
  resetToken: string;
  password: string;
}
