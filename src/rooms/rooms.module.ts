import { MiddlewareConsumer, Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsModule } from 'src/chats/chats.module';
import { isLoggedIn } from 'src/middleware/IsLoggedIn.middleware';
import { UsersModule } from 'src/users/users.module';
import { RoomRepository } from './room.repository';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { Room, RoomSchema } from './schemas/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
    UsersModule,
    forwardRef(() => ChatsModule),
  ],
  controllers: [RoomsController],
  providers: [RoomsService, RoomRepository],
  exports: [RoomsService],
})
export class RoomsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(isLoggedIn).forRoutes(RoomsController);
  }
}
