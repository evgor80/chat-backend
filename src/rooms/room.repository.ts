import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { RoomDto } from './dtos/room.dto';
import { Room, RoomDocument } from './schemas/room.schema';

@Injectable()
export class RoomRepository {
  constructor(@InjectModel(Room.name) private userModel: Model<RoomDocument>) {}

  async findAll() {
    return this.userModel.find({}).exec();
  }

  async findOne(name: string) {
    return this.userModel.findOne({ name }).exec();
  }

  async findOneWithMessages(name: string) {
    return this.userModel
      .findOne({ name })
      .populate({
        path: 'messages.author',
        select: '-_id username',
      })
      .exec();
  }

  async findOneBySlug(slug: string) {
    return this.userModel.findOne({ slug }).exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async create(user: RoomDto) {
    return this.userModel.create(user);
  }

  async updateOne(name: string, text: string, type: string, id: ObjectId) {
    return this.userModel.updateOne(
      { name },
      {
        $push: {
          messages: {
            text,
            type,
            author: id,
          },
        },
      },
    );
  }
}
