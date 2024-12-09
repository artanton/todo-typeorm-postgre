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
      name: seekedUser.name,
      avatarURL: seekedUser.avatarURL,
      verify: seekedUser.verify,
      email: seekedUser.email,
    };
  }

  async loginUser(user: SignInUserDto) {
    const { email, password } = user;
    const existedUser = await this.validateUser(email, password);
    if (existedUser) {
      // return this.jwtService.signAsync({ user });
      // const payload = { userId: existedUser.id, email: existedUser.email };

      const accessToken = await this.jwtService.signAsync({ user });

      const refreshToken = await this.jwtService.signAsync({ user });

      return {
        existedUser,
        accessToken,
        refreshToken,
      };
    }
    throw new HttpException(
      { status: HttpStatus.FORBIDDEN, error: 'Invalid Credentials' },
      HttpStatus.FORBIDDEN,
    );
  }
  async refreshAccessToken(refreshToken: string) {
    const user = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH,
    });
    console.log(user);
    // const refreshToken = await this.jwtService.signAsync({ user });
  }
}
