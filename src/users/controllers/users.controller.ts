import { JwtGuard } from '../guards/jwt.guard';
import { CreateUserDto } from '../user.dto/create-user.dto';
import { SignInUserDto } from '../user.dto/signin-user.dto';
import { UserService } from '../services/users.service';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
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
      secure: false,
      // sameSite: 'strict',
      // maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: loggedInUser.user,
      accessToken: loggedInUser.accessToken,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new HttpException(
        'Refresh token not provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const refreshedUser =
      await this.UserService.refreshAccessToken(refreshToken);

    res.cookie('refreshToken', refreshedUser.refreshToken, {
      httpOnly: true,
      secure: false,
      // sameSite: 'strict',
      // maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: refreshedUser.user,
      accessToken: refreshedUser.accessToken,
    };
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      throw new HttpException(
        'Access token not provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: false,
    });

    return await this.UserService.logout(accessToken);
  }
}
