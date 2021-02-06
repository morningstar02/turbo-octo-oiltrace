import UserDTO from '../../dtos/utils/user.dto';
import { userModel } from '../../models/utils/user-schema';

export default class UserDAO {
    public async create(user: UserDTO): Promise<UserDTO> {
      const saveUser = new userModel(user);
      return await saveUser.save();
    }
}
