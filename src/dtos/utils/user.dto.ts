export default class UserDTO {
  /*tslint:disable-next-line*/
  public _id: string;
  public created: {
    by: string;
    at: Date;
  };
  public email: string;
  public firstName: string;
  public hasPassword: boolean;
  public hasSecurityQuestions: boolean;
  public lastFailureTime: Date;
  public lastLoginTime: Date;
  public lastLogoutTime: Date;
  public lastName: string;
  public loginFailureAttempts: number;
  public modified: {
    by: string;
    at: Date;
  };
  public password: string;
  public passwordExpiryDate: Date;
  public passwordSecret: string;
  public resetPassword: boolean;
  public securityAnswer1: string;
  public securityAnswer2: string;
  public securityQuestion1: string;
  public securityQuestion2: string;
  public userType: string;
  public userStatus: string;
}
