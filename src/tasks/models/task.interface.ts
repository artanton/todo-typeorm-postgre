import { UsersEntity } from 'src/users/models/user.entity';

export interface ITask {
  id?: number;
  title?: string;
  text?: string;
  date?: string;
  subLevel?: number;
  parentId?: number;
  owner?: UsersEntity;
  createdAt?: Date;
  updatedAt?: Date;
}
