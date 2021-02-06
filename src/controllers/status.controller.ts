import express from 'express';
import IController from '../common/controller-interface';
import UserDAO from '../daos/utils/user.dao';
import UserDTO from '../dtos/utils/user.dto';
import catchError from '../error/catch-error';
import { userModel } from '../models/utils/user-schema';
import { logger } from '../util/winston';

export class StatusController implements IController {
    public path = '/status';
    public router = express.Router();
    private readonly userDAO: UserDAO;

    constructor() {
        this.userDAO = new UserDAO();
        logger.error('status controller');
        this.initializeRoutes();
    }

    public getStatus = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            let healthCheckSuccess: boolean = true;
            let mongoStatus: string = 'OK';
            try {
                await this.saveSampleUser();
                const oneUser = await userModel.findOne({ }).exec();
                // comment one of above
                logger.info(`mongoStatus: ${oneUser}`);
                // // check connectivity with mongo db
            } catch (error) {
                logger.error(error);
                mongoStatus = 'ERROR';
                healthCheckSuccess = false;
            }

            if (!healthCheckSuccess) {
                return res.status(500).json({ server: 'OK', mongoDB: mongoStatus });
            } else {
                return res.json({ server: 'OK', mongoDB: mongoStatus });
            }
        } catch (err) {
            catchError(err, next);
        }
    }

    public saveSampleUser = async () => {
        try {
               logger.info('#### Saving sample user');
               const userDetail: UserDTO = new UserDTO();
               userDetail.created = { at: new Date(), by: 'amritraj12@gmail.com' };
               userDetail.email = 'amritraj12@gmail.com';
               userDetail.userStatus = 'active';
               userDetail.userType = 'standard';
               userDetail.hasPassword = false;
               userDetail.hasSecurityQuestions = false;
               const createdUser: UserDTO = await this.userDAO.create(userDetail);
               logger.info('######', createdUser);
               return createdUser;
        } catch (err) {
            logger.error('save error', err);
        }
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, this.getStatus);
    }
}
