import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ChatsService } from './chats.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private usersService: UsersService,
    private chatsService: ChatsService,
  ) {}

  async handleDisconnect(socket: Socket) {
    await this.chatsService.removeUser(this.server, socket);
  }

  @SubscribeMessage('user-join')
  async handleEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    let user: User;
    try {
      user = await this.usersService.verifyToken(data.token);

      if (!user) {
        socket.emit('401');
        return;
      }
    } catch (error) {
      socket.emit('401');
      return;
    }
    await this.chatsService.addUser(
      this.server,
      socket,
      user,
      data.room,
      data.password,
    );
  }

  @SubscribeMessage('message')
  async handleMessageEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() msg: any,
  ) {
    let user: User;
    try {
      user = await this.usersService.verifyToken(msg.token);
      if (!user || user.username !== msg.message.author.username) {
        socket.emit('401');
        return;
      }
    } catch (error) {
      socket.emit('401');
      return;
    }
    await this.chatsService.addMessage(this.server, socket, msg, user._id);
  }

  @SubscribeMessage('user-typing')
  handleTypingEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    socket.to(data.room).emit('user-typing', { user: data.user });
  }
}
