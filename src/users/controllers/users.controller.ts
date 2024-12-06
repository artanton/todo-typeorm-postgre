import { CreateUserDto } from '../user.dto/create-user.dto';
import { SignInUserDto } from '../user.dto/signin-user.dto';
import { UserService } from './../services/users.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private UserService: UserService) {}

  @Post('register')
  register(@Body() user: CreateUserDto) {
    return this.UserService.registerUser(user);
  }
  @Post('login')
  login(@Body() user: SignInUserDto) {
    return this.UserService.loginUser(user);
  }
}
