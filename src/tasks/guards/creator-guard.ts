import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from 'src/users/services/users.service';
import { TasksService } from '../services/tasks.service';
import { IUser } from 'src/users/models/user.interface';

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private feedService: TasksService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params }: { user: IUser; params: { id: number } } = request;

    if (!user || !params) return false;

    // const userId = user.id;
    // const taskId = params.id;

    // Determine if logged-in user is the same as the user that created the feed post
    // return this.userService.findUserById(userId).pipe(
    //   switchMap((user: User) =>
    //     this.feedService.findPostById(feedId).pipe(
    //       map((feedPost: FeedPost) => {
    //         let isAuthor = user.id === feedPost.author.id;
    //         return isAuthor;
    //       }),
    //     ),
    //   ),
    // );
  }
}
