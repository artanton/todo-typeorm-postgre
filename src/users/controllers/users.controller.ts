import { JwtGuard } from '../guards/jwt.guard';
import { CreateUserDto } from '../user.dto/create-user.dto';
import { SignInUserDto } from '../user.dto/signin-user.dto';
import { UserService } from '../services/users.service';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { upload } from '../helpers/image-handler';

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
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
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
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
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

  @UseGuards(JwtGuard)
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('avatar', upload))
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<object> {
    const fileName = file?.filename;
    const email = req.user.email;
    if (!fileName) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'File must be a png, jpg/jpeg',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    this.UserService.updateAvatar(email, fileName);

    const imagesFolderPath = join(process.cwd(), 'images');
    const fullImagePath = join(imagesFolderPath + '/' + file.filename);
    return { fullImagePath };
    // const isFileExtensionSafe = await FileExtensionSafe(fullImagePath);
    // console.log(isFileExtensionSafe);
  }
}
