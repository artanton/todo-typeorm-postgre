import { ITask } from 'src/tasks/models/task.interface';

export interface IUser {
  id?: number;
  name?: string;
  email?: string;
  avatarURL?: string;
  password?: string;
  verify?: boolean;
  verificationCode?: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  tasks: ITask[];
}
