import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RoomDto } from './dtos/room.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async findAll() {
    return { rooms: await this.roomsService.findAll() };
  }

  @Get('name')
  async checkNameAvailability(@Query('name') name: string) {
    return await this.roomsService.checkNameAvailability(name);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return { room: await this.roomsService.findOneBySlug(slug) };
  }

  @Post()
  async create(@Body() room: RoomDto) {
    return { room: await this.roomsService.create(room) };
  }
}
