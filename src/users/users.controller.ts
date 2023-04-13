import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() user: UserDto) {
    return this.usersService.create(user);
  }
  @Get('name')
  checkUsernameAvailability(@Query('name') username: string) {
    return this.usersService.checkUsernameAvailability(username);
  }

  @Post('login')
  login(@Body() user: UserDto) {
    return this.usersService.login(user);
  }
}
