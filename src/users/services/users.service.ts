import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../models/user.entity';
import { CreateUserDto } from '../user.dto/create-user.dto';

import gravatar from 'gravatar-url';

import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
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
    const gravatarURL = gravatar(email, { size: 250 });
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

  async validateUser(password: string, email: string) {
    const seekedUser = await this.userRepository.findOne({ where: { email } });
    if (!seekedUser) {
      throw new HttpException(
        { status: HttpStatus.FORBIDDEN, error: 'Invalid Credentials' },
        HttpStatus.FORBIDDEN,
      );
    }
    const isValidPassword = bcrypt.compare(password, seekedUser.password);
    if (!isValidPassword) {
      throw new HttpException(
        { status: HttpStatus.FORBIDDEN, error: 'Invalid Credentials' },
        HttpStatus.FORBIDDEN,
      );
    }
    return seekedUser;
  }

  async loginUser(user: SignInUserDto) {
    const { email, password } = user;
    const existedUser = this.validateUser(email, password);
    if (existedUser) {
      return this.jwtService.signAsync({ user });
    }
  }
}
