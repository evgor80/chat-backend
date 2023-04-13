import { forwardRef, Module } from '@nestjs/common';
import { RoomsModule } from 'src/rooms/rooms.module';
import { UsersModule } from 'src/users/users.module';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';

@Module({
  imports: [forwardRef(() => RoomsModule), UsersModule],
  providers: [ChatsGateway, ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
