import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDto } from './dtos/user.dto';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from './user.repository';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UserRepository) {}

  async checkUsernameAvailability(username: string) {
    const user = await this.usersRepository.findOne(username);
    if (user) throw new HttpException('Имя уже занято', HttpStatus.CONFLICT);
    return { status: 'success' };
  }
  async create(user: UserDto) {
    const existedUser = await this.usersRepository.findOne(user.username);
    if (existedUser) {
      throw new HttpException('Имя пользователя занято', HttpStatus.CONFLICT);
    }
    const newUser = await this.usersRepository.create(user);
    newUser.password = undefined;
    return {
      status: 'success',
      user: newUser,
      token: this.generateToken(newUser),
    };
  }

  async login(user: UserDto) {
    const savedUser = await this.usersRepository.findOne(user.username);
    if (!savedUser || !(await savedUser.isCorrectPassword(user.password)))
      throw new HttpException(
        'Неверное имя пользователя или пароль',
        HttpStatus.UNAUTHORIZED,
      );

    return {
      status: 'success',
      token: this.generateToken(savedUser),
      user: { username: savedUser.username },
    };
  }

  private generateToken(user: User) {
    return jwt.sign(
      { username: user.username, id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
  }

  async verifyToken(token: string) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if ((decoded as jwt.JwtPayload).id) {
      const user = await this.usersRepository.findById(
        (decoded as jwt.JwtPayload).id,
      );
      return user;
    } else {
      return;
    }
  }
}
