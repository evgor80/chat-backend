import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { RoomsService } from 'src/rooms/rooms.service';
import { User } from 'src/users/schemas/user.schema';
import { emojis } from './utils/emojis';

@Injectable()
export class ChatsService {
  constructor(
    @Inject(forwardRef(() => RoomsService))
    private roomsService: RoomsService,
  ) {}
  currentUsers = new Map<string, Map<string, string>>();

  async addUser(
    server: Server,
    socket: Socket,
    user: User,
    roomName: string,
    password: string,
  ) {
    const room = await this.roomsService.findOneWithoutMapping(roomName);
    if (room === null) {
      socket.emit('404');
      return;
    }
    let isAuthorized = true;
    if (room.private) {
      isAuthorized = await room.isCorrectPassword(password);
    }
    if (!isAuthorized) {
      socket.emit('access-denied');
      return;
    } else {
      if (!this.currentUsers.has(roomName)) {
        this.currentUsers.set(roomName, new Map());
      }
      this.currentUsers.get(roomName).set(user.username, socket.id);

      const connUsers = this.getConnectedUsers(roomName);
      socket.to(roomName).emit('user-join', {
        message: { user: user.username, type: 'join' },
        members: connUsers,
      });
      socket.join(roomName);
      socket.emit('welcome', {
        members: connUsers,
        messages: room.messages,
      });
      server.emit('update', await this.getRoomInfo(roomName));
    }
  }

  async removeUser(server: Server, socket: Socket) {
    let leavedRoom = '';
    this.currentUsers.forEach((map, name) => {
      for (const [u, s] of map) {
        if (s === socket.id) {
          const user = u;
          map.delete(u);
          leavedRoom = name;
          socket.to(name).emit('user-leave', {
            message: { type: 'leave', user },
            members: this.getConnectedUsers(name),
          });
          socket.leave(name);
        }
      }
    });
    if (leavedRoom) {
      const room = await this.getRoomInfo(leavedRoom);
      server.emit('update', room);
    }
  }

  async addMessage(server: Server, socket: Socket, msg: any, id: ObjectId) {
    const message = this.sanitizeMessage(msg.message.text);
    await this.roomsService.pushMessage(
      msg.room,
      message,
      msg.message.type,
      id,
    );

    server.to(msg.room).emit('message-broadcast', {
      type: msg.message.type,
      author: { username: msg.message.author.username },
      text: message,
      createdAt: msg.message.createdAt,
    });

    const room = await this.getRoomInfo(msg.room);
    server.emit('update', room);
  }

  getConnectedUsers(room: string) {
    if (!this.currentUsers.get(room)) this.currentUsers.set(room, new Map());
    return Array.from(this.currentUsers.get(room).keys());
  }

  async getRoomInfo(name: string) {
    return await this.roomsService.findOneByName(name);
  }

  private sanitizeMessage(msg: string) {
    let message = msg
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&apos;')
      .replace(/"/g, '&quot;');

    emojis.forEach((emoji, index) => {
      const re = new RegExp(`${emoji.alt}`, 'g');
      message = message.replace(
        re,
        `<img src="/emojis/${index + 1}.png" alt="${
          emoji.alt
        }" width="30" height="30" ></img>`,
      );
    });
    return message;
  }
}
