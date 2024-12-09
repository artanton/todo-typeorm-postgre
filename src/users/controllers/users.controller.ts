import { CreateUserDto } from '../user.dto/create-user.dto';
import { SignInUserDto } from '../user.dto/signin-user.dto';
import { UserService } from './../services/users.service';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private UserService: UserService) {}

  @Post('register')
  register(@Body() user: CreateUserDto) {
    return this.UserService.registerUser(user);
  }
  @Post('login')
  async login(
    @Body() user: SignInUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loggedInUser = await this.UserService.loginUser(user);

    res.cookie('refreshToken', loggedInUser.refreshToken, {
      httpOnly: true,
      secure: true,
      // sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: loggedInUser.existedUser,
      accessToken: loggedInUser.accessToken,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    console.log('req', req);
    console.log('refreshToken', refreshToken);
    if (!refreshToken) {
      throw new HttpException(
        'Refresh token not provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const newAccessToken =
      await this.UserService.refreshAccessToken(refreshToken);

    return res.json(newAccessToken);
  }
}
