import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { ChatsService } from 'src/chats/chats.service';
import { RoomDto } from './dtos/room.dto';
import { RoomRepository } from './room.repository';
import { Room } from './schemas/room.schema';
import generateSlug from './utils/generateSlug';

@Injectable()
export class RoomsService {
  constructor(
    private roomsRepository: RoomRepository,
    @Inject(forwardRef(() => ChatsService))
    private chatsService: ChatsService,
  ) {}

  async findAll() {
    const rooms = await this.roomsRepository.findAll();
    return rooms.map((room) => this.mapRoom(room));
  }

  async findOneWithoutMapping(name: string) {
    return await this.roomsRepository.findOneWithMessages(name);
  }

  async findOneBySlug(slug: string) {
    const room = await this.roomsRepository.findOneBySlug(slug);
    if (!room) throw new HttpException('Чат не найден', HttpStatus.NOT_FOUND);
    return this.mapRoom(room);
  }

  async findOneByName(name: string) {
    const room = await this.roomsRepository.findOne(name);
    if (!room) return;
    return this.mapRoom(room);
  }

  async checkNameAvailability(name: string) {
    const room = await this.roomsRepository.findOne(name);
    if (room)
      throw new HttpException('Название чата занято', HttpStatus.CONFLICT);
    return { status: 'success' };
  }
  async create(room: RoomDto) {
    const existedRoom = await this.roomsRepository.findOne(room.name);
    if (existedRoom) {
      throw new HttpException('Название чата занято', HttpStatus.CONFLICT);
    }
    room.slug = generateSlug(room.name);
    const newRoom = await this.roomsRepository.create(room);
    newRoom.password = undefined;
    return newRoom;
  }

  async pushMessage(name: string, text: string, type: string, id: ObjectId) {
    await this.roomsRepository.updateOne(name, text, type, id);
  }

  mapRoom(room: Room) {
    return {
      id: room._id,
      name: room.name,
      slug: room.slug,
      private: room.private,
      messages: room.messages.length,
      members: this.chatsService.getConnectedUsers(room.name).length,
      createdAt: room.createdAt,
    };
  }
}
