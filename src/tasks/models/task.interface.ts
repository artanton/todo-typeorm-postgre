import { IUser } from 'src/users/models/user.interface';

export interface ITask {
  id?: number;
  title?: string;
  text?: string;
  date?: string;
  subLevel?: number;
  parentId?: number;
  owner?: IUser;
  createdAt?: Date;
  updatedAt?: Date;
}
