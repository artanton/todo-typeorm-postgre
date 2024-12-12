import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../models/user.entity';
import { CreateUserDto } from '../user.dto/create-user.dto';

// import gravatar from 'gravatar-url';

import * as bcrypt from 'bcrypt';
// import { nanoid } from 'nanoid';
import { SignInUserDto } from '../user.dto/signin-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    private jwtService: JwtService,
  ) {}

  async registerUser(user: CreateUserDto) {
    const { password, email } = user;
    const hashedPassword = await bcrypt.hash(password, 10);
    const gravatar = await import('gravatar-url');
    const nanoid = (await import('nanoid')).nanoid;
    const gravatarURL = gravatar.default(email, { size: 250 });
    const verificationCode = nanoid();
    const registredUser = await this.userRepository.find({ where: { email } });
    if (registredUser[0]) {
      throw new HttpException('Email in use', HttpStatus.BAD_REQUEST);
    }
    const result = await this.userRepository.save({
      ...user,
      password: hashedPassword,
      verificationCode: verificationCode,
      avatarURL: gravatarURL,
    });

    return {
      name: result.name,
      avatarURL: result.avatarURL,
      verify: result.verify,
      email: result.email,
    };
  }

  async validateUser(email: string, password: string) {
    const seekedUser = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
    if (!seekedUser) {
      throw new HttpException(
        { status: HttpStatus.FORBIDDEN, error: 'Invalid Credentials' },
        HttpStatus.FORBIDDEN,
      );
    }

    const isValidPassword = await bcrypt.compare(password, seekedUser.password);
    if (!isValidPassword) {
      throw new HttpException(
        { status: HttpStatus.FORBIDDEN, error: 'Invalid Credentials' },
        HttpStatus.FORBIDDEN,
      );
    }
    return {
      id: seekedUser.id,
      name: seekedUser.name,
      avatarURL: seekedUser.avatarURL,
      verify: seekedUser.verify,
      email: seekedUser.email,
    };
  }

  async generateTokens(email: string) {
    const payload = { email: email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS,
      expiresIn: '600s',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH,
      expiresIn: '7d',
    });

    const hashedRefrshToken = await bcrypt.hash(refreshToken, 10);
    return { accessToken, refreshToken, hashedRefrshToken };
  }

  async loginUser(user: SignInUserDto) {
    const { email, password } = user;
    const existedUser = await this.validateUser(email, password);
    if (existedUser) {
      const tokens = await this.generateTokens(existedUser.email);

      const updatedUser = await this.userRepository.update(existedUser.id, {
        refreshToken: tokens.hashedRefrshToken,
      });
      if (updatedUser.affected === 0) {
        throw new HttpException(
          { status: HttpStatus.FORBIDDEN, error: 'something went wrong' },
          HttpStatus.FORBIDDEN,
        );
      }
      return {
        user: existedUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    }
    throw new HttpException(
      { status: HttpStatus.FORBIDDEN, error: 'Invalid Credentials' },
      HttpStatus.FORBIDDEN,
    );
  }
  async refreshAccessToken(refreshToken: string) {
    try {
      const verifiedToken = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH,
      });

      const email = verifiedToken.email;
      const existedUser = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.refreshToken')
        .where('user.email = :email', { email })
        .getOne();

      if (!existedUser) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Invalid refresh token, try to login again',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const isValidRefreshToken = await bcrypt.compare(
        refreshToken,
        existedUser.refreshToken,
      );

      if (!isValidRefreshToken) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Invalid refresh token, try to login again',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const tokens = await this.generateTokens(existedUser.email);
      await this.userRepository.update(existedUser.id, {
        refreshToken: tokens.hashedRefrshToken,
      });

      const updatedUser = await this.userRepository.findOne({
        where: { id: existedUser.id },
      });
      return {
        user: updatedUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'Refresh token expired, please login again',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw error;
    }
  }

  async logout(accessToken: string) {
    const payload = await this.jwtService.verifyAsync(accessToken, {
      secret: process.env.JWT_ACCESS,
    });

    const email = payload.email;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const updatedUser = await this.userRepository.update(user.id, {
      refreshToken: '',
    });

    if (!updatedUser) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Logout failed',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return { message: 'Logout successful' };
  }
}
