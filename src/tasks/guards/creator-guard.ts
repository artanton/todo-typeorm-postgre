import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from 'src/users/services/users.service';
import { TasksService } from '../services/tasks.service';
import { IUser } from 'src/users/models/user.interface';

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private taskService: TasksService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params }: { user: IUser; params: { id: number } } = request;
    if (!user || !params) return false;

    const userId = user.id;
    const taskId = Number(params.id);
    // Determine if logged-in user is the same as the user that created the task

    try {
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const task = await this.taskService.findTaskById(taskId);
      if (!task) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      return user.id === task.owner.id;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
