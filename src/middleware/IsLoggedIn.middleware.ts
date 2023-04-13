import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class isLoggedIn implements NestMiddleware {
  constructor(private usersService: UsersService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    let token: string;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      throw new HttpException(
        'Доступ только для зарегистрированных пользователей. Войдите в систему или зарегистрируйтесь',
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const user = await this.usersService.verifyToken(token);
      res.locals.user = user;
    } catch {
      throw new HttpException('Негодный токен', HttpStatus.UNAUTHORIZED);
    }

    next();
  }
}
