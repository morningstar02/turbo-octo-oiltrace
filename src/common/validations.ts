import express from 'express';
import HandledApplicationError from '../error/handled-application-error';
import throwIfInputValidationError from '../error/input-validation-error';

export class Validation {

  public async validateRegisterUser(req: express.Request): Promise<any> {
    req
      .checkBody('email', "Mandatory field 'email' missing in request body")
      .exists();
    req
      .checkBody(
        'password', "Mandatory field 'password' missing in request body"
      )
      .exists();
   /* req
      .checkBody(
        'firstName', "Mandatory field 'firstName' missing in request body"
      )
      .exists();
    req
      .checkBody(
        'lastName', "Mandatory field 'lastName' missing in request body"
      )
      .exists();
    req
      .checkBody(
        'userType', "Mandatory field 'userType' missing in request body"
      )
      .exists();*/
    await throwIfInputValidationError(req);

    req.checkBody('email', 'Invalid email').isEmail();
    req
      .checkBody(
        'password',
        'Password must be a combination of one uppercase, one lower case, ' +
          'one special char, one digit and minimum 6 chars long'
      )
      .matches(/^(?=.*\d)(?=.*[~`!@#$%^&*()_=+}{|;:'"<>,.\\/[\]\?-])(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d~`!@#$%^&*()_=+}{|;:'"<>,.\\/[\]\?-]{6,}$/);
    req
      .checkBody('userType', 'Invalid userType')
      .isIn(['advertiser', 'publisher', 'admin']);

    await throwIfInputValidationError(req);
  }

  public async validatePasswordInput(req: express.Request, password: string): Promise<any> {
    req
      .checkBody(password, `Mandatory field ${password} missing in request body`)
      .exists();
    req
      .checkBody(
        password,
        `${password} must be a combination of one uppercase, one lower case, ` +
        'one special char, one digit and minimum 6 chars long'
      )
      .matches(/^(?=.*\d)(?=.*[~`!@#$%^&*()_=+}{|;:'"<>,.\\/[\]\?-])(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d~`!@#$%^&*()_=+}{|;:'"<>,.\\/[\]\?-]{6,}$/);

    await throwIfInputValidationError(req);
  }

  public async validateChangePasswordReq(req: express.Request): Promise<any> {
    req
      .checkBody('currentPwd', "Mandatory field 'currentPwd' missing in request body")
      .exists();
    req
      .checkBody('newPassword', "Mandatory field 'newPassword' missing in request body")
      .exists();

    await throwIfInputValidationError(req);

    req
      .checkBody(
        'newPassword',
        'New Password must be a combination of one uppercase, one lower case, ' +
          'one special char, one digit and minimum 6 chars long'
      )
      .matches(/^(?=.*\d)(?=.*[~`!@#$%^&*()_=+}{|;:'"<>,.\\/[\]\?-])(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d~`!@#$%^&*()_=+}{|;:'"<>,.\\/[\]\?-]{6,}$/);

    await throwIfInputValidationError(req);

    req
      .checkBody('newPassword', 'New password should not be same as the current password')
      .not().equals(req.body.currentPwd);

    await throwIfInputValidationError(req);

  }

  public async validateSecurityQuestionsReq(req: express.Request): Promise<any> {
    req
      .checkBody('securityQuestion1', 'Security Question is required')
      .notEmpty();
    req.checkBody('securityAnswer1', 'Answer is required').notEmpty();
    req
      .checkBody('securityQuestion2', 'Security Question 2 is required')
      .notEmpty();
    req.checkBody('securityAnswer2', 'Answer 2 is required').notEmpty();

    const errors = req.validationErrors();
    if (errors) {
      throw new HandledApplicationError(400, 'Security question/answers not provided');
    }

  }

}
