import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from './dtos/user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async create(user: UserDto) {
    return this.userModel.create(user);
  }
}
