import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../models/user.entity';
import { CreateUserDto } from '../user.dto/create-user.dto';

import gravatar from 'gravatar-url';

import bcrypt from 'bcrypt';

import { nanoid } from 'nanoid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
  ) {}

  async registerUser(user: CreateUserDto) {
    const { password, email } = user;
    // const hashedPassword = await bcrypt.hash(password, 10);
    const gravatarURL = gravatar(email, { size: 250 });
    const verificationCode = nanoid();
    const registredUser = await this.userRepository.find({ where: { email } });
    if (registredUser) {
      throw new NotAcceptableException('Email in use');
    }
    const result = await this.userRepository.save({
      ...user,
      password: password,
      verificationCode: verificationCode,
      avatarURL: gravatarURL,
    });

    return result;
  }
}
